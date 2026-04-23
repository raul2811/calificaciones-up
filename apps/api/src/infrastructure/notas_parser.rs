#![allow(dead_code)]

use scraper::{ElementRef, Html, Selector};

use crate::{
    application::notes_credits_parser::{NotesCreditsParser, NotesCreditsParserError},
    domain::academic_progress::SubjectGradeRecord,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NotasParserError {
    MissingCreditsTab,
}

pub struct NotasCreditosCompletosParser;
pub struct ScraperNotesCreditsParser;

impl NotasCreditosCompletosParser {
    pub fn parse(html: &str) -> Result<Vec<SubjectGradeRecord>, NotasParserError> {
        let document = Html::parse_document(html);

        let tab_selector = Selector::parse("#tabsCreditComp").expect("valid selector");
        let block_selector =
            Selector::parse("h1,h2,h3,h4,h5,h6,strong,caption,table").expect("valid selector");
        let table_selector = Selector::parse("table").expect("valid selector");

        let Some(tab) = document.select(&tab_selector).next() else {
            return Err(NotasParserError::MissingCreditsTab);
        };

        let mut records = Vec::new();
        let mut current_period_label: Option<String> = None;

        for block in tab.select(&block_selector) {
            let tag = block.value().name();

            if tag == "table" {
                records.extend(parse_table_records(&block, current_period_label.clone()));
                continue;
            }

            let text = element_text(&block);
            if looks_like_period_label(&text) {
                current_period_label = Some(text);
            }
        }

        if records.is_empty() {
            // Fallback: parse all tables under tab even if no heading selector matched.
            for table in tab.select(&table_selector) {
                records.extend(parse_table_records(&table, current_period_label.clone()));
            }
        }

        Ok(records)
    }
}

impl NotesCreditsParser for ScraperNotesCreditsParser {
    fn parse(&self, html: &str) -> Result<Vec<SubjectGradeRecord>, NotesCreditsParserError> {
        NotasCreditosCompletosParser::parse(html).map_err(|_| NotesCreditsParserError)
    }
}

fn parse_table_records(
    table: &ElementRef<'_>,
    period_label: Option<String>,
) -> Vec<SubjectGradeRecord> {
    let header_selector = Selector::parse("thead th").expect("valid selector");
    let row_selector = Selector::parse("tbody tr").expect("valid selector");
    let fallback_row_selector = Selector::parse("tr").expect("valid selector");
    let cell_selector = Selector::parse("td").expect("valid selector");

    let mut c_hor_idx = None;
    let mut abbreviation_idx = None;
    let mut code_idx = None;
    let mut name_idx = None;
    let mut num_idx = None;
    let mut credits_idx = None;
    let mut grade_idx = None;
    let mut points_idx = None;
    let mut index_idx = None;

    for (idx, th) in table.select(&header_selector).enumerate() {
        let header = canonicalize(&element_text(&th));

        if header.contains("chor") || header.contains("c hor") {
            c_hor_idx = Some(idx);
        }
        if header.contains("abrev") {
            abbreviation_idx = Some(idx);
        }
        if header == "asig" || header.contains("asig") {
            code_idx = Some(idx);
        }
        if header.contains("denominacion") {
            name_idx = Some(idx);
        }
        if header == "num" {
            num_idx = Some(idx);
        }
        if header == "cr" || header.contains("credito") {
            credits_idx = Some(idx);
        }
        if header.contains("nota") {
            grade_idx = Some(idx);
        }
        if header.contains("puntos") || header.contains("punto") {
            points_idx = Some(idx);
        }
        if header.contains("indice") {
            index_idx = Some(idx);
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
            if cells.len() >= 9 {
                if c_hor_idx.is_none() {
                    c_hor_idx = Some(0);
                }
                if abbreviation_idx.is_none() {
                    abbreviation_idx = Some(1);
                }
                if code_idx.is_none() {
                    code_idx = Some(2);
                }
                if name_idx.is_none() {
                    name_idx = Some(3);
                }
                if num_idx.is_none() {
                    num_idx = Some(4);
                }
                if credits_idx.is_none() {
                    credits_idx = Some(5);
                }
                if grade_idx.is_none() {
                    grade_idx = Some(6);
                }
                if points_idx.is_none() {
                    points_idx = Some(7);
                }
                if index_idx.is_none() {
                    index_idx = Some(8);
                }
            }

            let period_year = period_label.as_ref().and_then(|label| extract_year(label));
            let period_semester_type = period_label
                .as_ref()
                .and_then(|label| extract_semester_type(label));

            SubjectGradeRecord {
                source: "notas_creditos_completos".to_string(),
                academic_period_label: period_label.clone(),
                period_year,
                period_semester_type,
                c_hor: get_cell(&cells, c_hor_idx),
                abbreviation: get_cell(&cells, abbreviation_idx),
                code: get_cell(&cells, code_idx),
                name: get_cell(&cells, name_idx),
                num: get_cell(&cells, num_idx),
                credits: get_cell(&cells, credits_idx),
                grade: get_cell(&cells, grade_idx),
                points: get_cell(&cells, points_idx),
                index_value: get_cell(&cells, index_idx),
            }
        })
        .collect()
}

fn get_cell(cells: &[String], idx: Option<usize>) -> Option<String> {
    idx.and_then(|index| cells.get(index))
        .map(|value| normalize_text(value))
        .filter(|value| !value.is_empty())
}

fn looks_like_period_label(value: &str) -> bool {
    let normalized = canonicalize(value);

    (normalized.contains("semestre") || normalized.contains("anual"))
        && extract_year(value).is_some()
}

fn extract_year(value: &str) -> Option<String> {
    value
        .split(|ch: char| !ch.is_ascii_digit())
        .find(|chunk| chunk.len() == 4 && chunk.starts_with("20"))
        .map(|chunk| chunk.to_string())
}

fn extract_semester_type(value: &str) -> Option<String> {
    let normalized = canonicalize(value);

    if normalized.contains("primer semestre") {
        return Some("primer".to_string());
    }

    if normalized.contains("segundo semestre") {
        return Some("segundo".to_string());
    }

    if normalized.contains("anual") {
        return Some("anual".to_string());
    }

    if normalized.contains("verano") {
        return Some("verano".to_string());
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
    fn parses_tabs_credit_comp_with_periods() {
        let html = r#"
        <html>
          <body>
            <div id="tabsCreditComp">
              <h4>Segundo Semestre de 2022</h4>
              <table>
                <thead>
                  <tr>
                    <th>C.Hor</th><th>Abrev.</th><th>Asig.</th><th>Denominación</th><th>Num.</th><th>CR.</th><th>Nota</th><th>Puntos</th><th>Indice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>64</td><td>MAT</td><td>10097</td><td>CALCULO INTEGRAL</td><td>1</td><td>5</td><td>F</td><td>0</td><td>0.00</td>
                  </tr>
                </tbody>
              </table>
              <h4>Anuales de 2023</h4>
              <table>
                <tbody>
                  <tr>
                    <td>64</td><td>MAT</td><td>10097</td><td>CALCULO INTEGRAL</td><td>2</td><td>5</td><td>C</td><td>11</td><td>2.20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </body>
        </html>
        "#;

        let rows = NotasCreditosCompletosParser::parse(html).expect("should parse");
        assert_eq!(rows.len(), 2);

        assert_eq!(rows[0].period_year.as_deref(), Some("2022"));
        assert_eq!(rows[0].period_semester_type.as_deref(), Some("segundo"));
        assert_eq!(rows[0].grade.as_deref(), Some("F"));

        assert_eq!(rows[1].period_year.as_deref(), Some("2023"));
        assert_eq!(rows[1].period_semester_type.as_deref(), Some("anual"));
        assert_eq!(rows[1].grade.as_deref(), Some("C"));
    }
}
