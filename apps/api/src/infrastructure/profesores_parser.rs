#![allow(dead_code)]

use scraper::{ElementRef, Html, Selector};

use crate::{
    application::professors_parser::{ProfessorsParser, ProfessorsParserError},
    domain::academic_progress::ProfessorRecord,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProfesoresParserError {
    MissingProfessorTable,
}

pub struct MisProfesoresParser;
pub struct ScraperProfessorsParser;

impl MisProfesoresParser {
    pub fn parse(html: &str) -> Result<Vec<ProfessorRecord>, ProfesoresParserError> {
        let document = Html::parse_document(html);
        let block_selector =
            Selector::parse("h1,h2,h3,h4,h5,h6,strong,p,table").expect("valid selector");

        let mut records = Vec::new();
        let mut current_period_label: Option<String> = None;

        for block in document.select(&block_selector) {
            let tag = block.value().name();

            if tag == "table" {
                if table_looks_like_professors(&block) {
                    records.extend(parse_professors_table(&block, current_period_label.clone()));
                }

                continue;
            }

            let text = element_text(&block);
            if looks_like_period_label(&text) {
                current_period_label = Some(text);
            }
        }

        if records.is_empty() {
            return Err(ProfesoresParserError::MissingProfessorTable);
        }

        Ok(records)
    }
}

impl ProfessorsParser for ScraperProfessorsParser {
    fn parse(&self, html: &str) -> Result<Vec<ProfessorRecord>, ProfessorsParserError> {
        MisProfesoresParser::parse(html).map_err(|_| ProfessorsParserError)
    }
}

fn parse_professors_table(
    table: &ElementRef<'_>,
    period_label: Option<String>,
) -> Vec<ProfessorRecord> {
    let header_selector = Selector::parse("thead th").expect("valid selector");
    let row_selector = Selector::parse("tbody tr").expect("valid selector");
    let fallback_row_selector = Selector::parse("tr").expect("valid selector");
    let cell_selector = Selector::parse("td").expect("valid selector");

    let mut c_hor_idx = None;
    let mut code_idx = None;
    let mut name_idx = None;
    let mut professor_idx = None;
    let mut email_idx = None;

    for (idx, th) in table.select(&header_selector).enumerate() {
        let header = canonicalize(&element_text(&th));

        if header.contains("chor") || header.contains("c hor") {
            c_hor_idx = Some(idx);
        }
        if header == "asig" || header.contains("asig") {
            code_idx = Some(idx);
        }
        if header.contains("denominacion") || header == "materia" {
            name_idx = Some(idx);
        }
        if header.contains("profesor") {
            professor_idx = Some(idx);
        }
        if header.contains("correo") || header.contains("email") {
            email_idx = Some(idx);
        }
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

    rows.into_iter()
        .map(|cells| {
            if cells.len() >= 5 {
                if c_hor_idx.is_none() {
                    c_hor_idx = Some(0);
                }
                if code_idx.is_none() {
                    code_idx = Some(1);
                }
                if name_idx.is_none() {
                    name_idx = Some(2);
                }
                if professor_idx.is_none() {
                    professor_idx = Some(3);
                }
                if email_idx.is_none() {
                    email_idx = Some(4);
                }
            }

            let professor_name = get_cell(&cells, professor_idx);
            let normalized_professor = professor_name
                .as_ref()
                .map(|value| canonicalize(value))
                .unwrap_or_default();

            let assignment_pending =
                normalized_professor.is_empty() || normalized_professor == "nombrar por";

            ProfessorRecord {
                source: "mis_profesores".to_string(),
                academic_period_label: period_label.clone(),
                period_year: period_label.as_ref().and_then(|label| extract_year(label)),
                period_type: period_label
                    .as_ref()
                    .and_then(|label| extract_period_type(label)),
                c_hor: get_cell(&cells, c_hor_idx),
                code: get_cell(&cells, code_idx),
                name: get_cell(&cells, name_idx),
                professor_name,
                professor_email: get_cell(&cells, email_idx),
                assignment_pending,
            }
        })
        .collect()
}

fn table_looks_like_professors(table: &ElementRef<'_>) -> bool {
    let header_selector = Selector::parse("thead th").expect("valid selector");

    let headers: Vec<String> = table
        .select(&header_selector)
        .map(|th| canonicalize(&element_text(&th)))
        .collect();

    if headers.is_empty() {
        return false;
    }

    let has_professor = headers.iter().any(|header| header.contains("profesor"));
    let has_email = headers
        .iter()
        .any(|header| header.contains("correo") || header.contains("email"));
    let has_subject = headers
        .iter()
        .any(|header| header.contains("asig") || header.contains("denominacion"));

    has_professor && has_email && has_subject
}

fn get_cell(cells: &[String], idx: Option<usize>) -> Option<String> {
    idx.and_then(|index| cells.get(index))
        .map(|value| normalize_text(value))
        .filter(|value| !value.is_empty())
}

fn looks_like_period_label(value: &str) -> bool {
    let normalized = canonicalize(value);

    (normalized.contains("semestre")
        || normalized.contains("anuales")
        || normalized.contains("anual"))
        && extract_year(value).is_some()
}

fn extract_year(value: &str) -> Option<String> {
    value
        .split(|ch: char| !ch.is_ascii_digit())
        .find(|chunk| chunk.len() == 4 && chunk.starts_with("20"))
        .map(|chunk| chunk.to_string())
}

fn extract_period_type(value: &str) -> Option<String> {
    let normalized = canonicalize(value);

    if normalized.contains("primer semestre") {
        return Some("primer".to_string());
    }

    if normalized.contains("segundo semestre") {
        return Some("segundo".to_string());
    }

    if normalized.contains("anual") || normalized.contains("anuales") {
        return Some("anual".to_string());
    }

    None
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
        .replace('.', "")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_mis_profesores_rows() {
        let html = r#"
            <html>
              <body>
                <h4>Anuales de 2026</h4>
                <table>
                  <thead>
                    <tr>
                      <th>C.Hor</th><th>Asig.</th><th>Denominación</th><th>Profesor</th><th>Correo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>64</td><td>10142</td><td>DISENO DE COMPILADORES</td><td>NOMBRAR POR</td><td></td>
                    </tr>
                    <tr>
                      <td>64</td><td>10147</td><td>ETICA PROFESIONAL</td><td>SHISSEL MERICE CONCEPCION FUENTES</td><td>shissel.concepcion@up.ac.pa</td>
                    </tr>
                  </tbody>
                </table>
              </body>
            </html>
        "#;

        let rows = MisProfesoresParser::parse(html).expect("should parse");
        assert_eq!(rows.len(), 2);

        assert_eq!(rows[0].code.as_deref(), Some("10142"));
        assert!(rows[0].assignment_pending);
        assert_eq!(rows[0].period_year.as_deref(), Some("2026"));
        assert_eq!(rows[0].period_type.as_deref(), Some("anual"));

        assert_eq!(rows[1].code.as_deref(), Some("10147"));
        assert!(!rows[1].assignment_pending);
        assert_eq!(
            rows[1].professor_email.as_deref(),
            Some("shissel.concepcion@up.ac.pa")
        );
    }
}
