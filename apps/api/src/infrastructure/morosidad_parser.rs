#![allow(dead_code)]

use std::collections::HashMap;

use scraper::{ElementRef, Html, Selector};

use crate::{
    application::morosidad_parser::{MorosidadParser, MorosidadParserError},
    domain::academic_progress::{MorosidadRecord, MorosidadStatus, MorosidadSummary},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MorosidadHtmlParserError {
    MissingMorosidadTable,
}

pub struct MorosidadHtmlParser;
pub struct ScraperMorosidadParser;

impl MorosidadHtmlParser {
    pub fn parse(html: &str) -> Result<MorosidadSummary, MorosidadHtmlParserError> {
        let document = Html::parse_document(html);

        let summary_kv = parse_summary_kv(&document);
        let records = parse_records(&document)?;

        let status = derive_status(&records);

        Ok(MorosidadSummary {
            year: summary_kv.get("ano").cloned(),
            current_semester_or_cycle: summary_kv.get("sem / ciclo").cloned(),
            status,
            records,
        })
    }
}

impl MorosidadParser for ScraperMorosidadParser {
    fn parse(&self, html: &str) -> Result<MorosidadSummary, MorosidadParserError> {
        MorosidadHtmlParser::parse(html).map_err(|_| MorosidadParserError)
    }
}

fn parse_summary_kv(document: &Html) -> HashMap<String, String> {
    let selector =
        Selector::parse("div.contentInstrucciones div.destacado span").expect("valid selector");

    let mut values = HashMap::new();
    for span in document.select(&selector) {
        let text = element_text(&span);
        if let Some((label, value)) = split_label_value(&text) {
            values.insert(canonicalize(label), value.to_string());
        }
    }

    values
}

fn parse_records(document: &Html) -> Result<Vec<MorosidadRecord>, MorosidadHtmlParserError> {
    let table_selector = Selector::parse("table").expect("valid selector");
    let header_selector = Selector::parse("thead th").expect("valid selector");
    let row_selector = Selector::parse("tbody tr").expect("valid selector");
    let fallback_row_selector = Selector::parse("tr").expect("valid selector");
    let cell_selector = Selector::parse("td").expect("valid selector");

    for table in document.select(&table_selector) {
        let mut message_idx = None;
        let mut balance_idx = None;

        for (idx, th) in table.select(&header_selector).enumerate() {
            let header = canonicalize(&element_text(&th));
            if header.contains("mensaje") {
                message_idx = Some(idx);
            }
            if header.contains("saldo") {
                balance_idx = Some(idx);
            }
        }

        let has_morosidad_headers = message_idx.is_some() || balance_idx.is_some();
        if !has_morosidad_headers {
            continue;
        }

        let mut rows: Vec<Vec<String>> = table
            .select(&row_selector)
            .map(|row| {
                row.select(&cell_selector)
                    .map(|cell| element_text(&cell))
                    .collect::<Vec<_>>()
            })
            .filter(|cells| !cells.is_empty())
            .collect();

        if rows.is_empty() {
            rows = table
                .select(&fallback_row_selector)
                .map(|row| {
                    row.select(&cell_selector)
                        .map(|cell| element_text(&cell))
                        .collect::<Vec<_>>()
                })
                .filter(|cells| !cells.is_empty())
                .collect();
        }

        let records = rows
            .into_iter()
            .map(|cells| MorosidadRecord {
                message: get_cell(&cells, message_idx.or(Some(0))),
                balance: get_cell(&cells, balance_idx.or(Some(1))),
            })
            .collect::<Vec<_>>();

        return Ok(records);
    }

    Err(MorosidadHtmlParserError::MissingMorosidadTable)
}

fn derive_status(records: &[MorosidadRecord]) -> MorosidadStatus {
    let mut has_paz_y_salvo = false;
    let mut has_debt = false;

    for record in records {
        let message = record
            .message
            .as_ref()
            .map(|value| canonicalize(value))
            .unwrap_or_default();

        let balance = record
            .balance
            .as_ref()
            .map(|value| value.trim().to_string())
            .unwrap_or_default();
        let balance_normalized = canonicalize(&balance);

        if message.contains("paz y salvo") && balance_normalized.is_empty() {
            has_paz_y_salvo = true;
        }

        let has_numeric_debt = !balance_normalized.is_empty()
            && balance_normalized != "0"
            && balance_normalized != "000"
            && balance_normalized != "0000"
            && balance_normalized != "000000";

        if has_numeric_debt || message.contains("deuda") || message.contains("moros") {
            has_debt = true;
        }
    }

    if has_debt {
        return MorosidadStatus::Moroso;
    }

    if has_paz_y_salvo {
        return MorosidadStatus::PazYSalvo;
    }

    MorosidadStatus::Desconocido
}

fn get_cell(cells: &[String], idx: Option<usize>) -> Option<String> {
    idx.and_then(|index| cells.get(index))
        .map(|value| normalize_text(value))
        .filter(|value| !value.is_empty())
}

fn split_label_value(input: &str) -> Option<(&str, &str)> {
    input
        .split_once(':')
        .map(|(label, value)| (label.trim(), value.trim()))
}

fn element_text(element: &ElementRef<'_>) -> String {
    normalize_text(&element.text().collect::<Vec<_>>().join(" "))
}

fn normalize_text(input: &str) -> String {
    input.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn canonicalize(input: &str) -> String {
    input
        .trim()
        .to_lowercase()
        .replace('á', "a")
        .replace('é', "e")
        .replace('í', "i")
        .replace('ó', "o")
        .replace('ú', "u")
        .replace('ñ', "n")
        .replace(['.', ',', '$'], "")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_paz_y_salvo_morosidad() {
        let html = r#"
            <html>
              <body>
                <div class='contentInstrucciones'>
                  <div class='destacado formulario'>
                    <span><strong>Año:</strong>2026</span>
                    <span><strong>Sem / Ciclo:</strong>1</span>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr><th>Mensaje</th><th>Saldo</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Paz y Salvo</td><td></td></tr>
                  </tbody>
                </table>
              </body>
            </html>
        "#;

        let parsed = MorosidadHtmlParser::parse(html).expect("should parse");
        assert_eq!(parsed.year.as_deref(), Some("2026"));
        assert_eq!(parsed.current_semester_or_cycle.as_deref(), Some("1"));
        assert_eq!(parsed.status, MorosidadStatus::PazYSalvo);
        assert_eq!(parsed.records.len(), 1);
    }

    #[test]
    fn parses_moroso_when_balance_exists() {
        let html = r#"
            <html>
              <body>
                <table>
                  <thead>
                    <tr><th>Mensaje</th><th>Saldo</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Saldo pendiente</td><td>120.50</td></tr>
                  </tbody>
                </table>
              </body>
            </html>
        "#;

        let parsed = MorosidadHtmlParser::parse(html).expect("should parse");
        assert_eq!(parsed.status, MorosidadStatus::Moroso);
        assert_eq!(parsed.records[0].balance.as_deref(), Some("120.50"));
    }
}
