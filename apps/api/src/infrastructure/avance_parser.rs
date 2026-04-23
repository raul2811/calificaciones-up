#![allow(dead_code)]

use std::collections::HashMap;

use scraper::{Html, Selector};

use crate::{
    application::academic_progress_parser::{AcademicProgressParser, AcademicProgressParserError},
    domain::academic_progress::{AvanceAcademicData, StudentAcademicSummary, SubjectRecord},
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AvanceParserError {
    MissingField(&'static str),
    MissingSubjectsTable,
}

pub struct AvanceAcademicoParser;
pub struct ScraperAcademicProgressParser;

impl AvanceAcademicoParser {
    pub fn parse(html: &str) -> Result<AvanceAcademicData, AvanceParserError> {
        let document = Html::parse_document(html);

        let summary_kv = parse_summary_kv(&document);
        let profile_kv = parse_profile_kv(&document);

        let first_name = profile_kv.get("nombre").cloned().unwrap_or_default();
        let apellido = profile_kv
            .get("apellido paterno")
            .cloned()
            .unwrap_or_default();
        let name = normalize_text(&format!("{} {}", first_name, apellido));

        let student = StudentAcademicSummary {
            name: require_non_empty(name, "name")?,
            career: require_map_value(&profile_kv, "carrera", "career")?,
            plan: require_map_value(&profile_kv, "plan", "plan")?,
            current_index: require_map_value(&summary_kv, "indice", "current_index")?,
            current_year: require_map_value(&summary_kv, "ano", "current_year")?,
            current_semester: require_map_value(&summary_kv, "sem / ciclo", "current_semester")?,
        };

        let subjects = parse_subjects(&document)?;

        Ok(AvanceAcademicData { student, subjects })
    }
}

impl AcademicProgressParser for ScraperAcademicProgressParser {
    fn parse(&self, html: &str) -> Result<AvanceAcademicData, AcademicProgressParserError> {
        AvanceAcademicoParser::parse(html).map_err(|_| AcademicProgressParserError)
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

fn parse_profile_kv(document: &Html) -> HashMap<String, String> {
    let selector = Selector::parse("div.contentInstrucciones table.display p.fltlft.peq")
        .expect("valid selector");

    let mut values = HashMap::new();
    for p in document.select(&selector) {
        let text = element_text(&p);
        if let Some((label, value)) = split_label_value(&text) {
            values.insert(canonicalize(label), value.to_string());
        }
    }

    values
}

fn parse_subjects(document: &Html) -> Result<Vec<SubjectRecord>, AvanceParserError> {
    let table_selector = Selector::parse("table#listado").expect("valid selector");
    let header_selector = Selector::parse("thead th").expect("valid selector");
    let row_selector = Selector::parse("tbody tr").expect("valid selector");
    let cell_selector = Selector::parse("td").expect("valid selector");

    let Some(table) = document.select(&table_selector).next() else {
        return Err(AvanceParserError::MissingSubjectsTable);
    };

    let mut plan_year_idx = None;
    let mut plan_semester_idx = None;
    let mut code_idx = None;
    let mut name_idx = None;
    let mut credits_idx = None;
    let mut grade_idx = None;
    let mut taken_year_idx = None;
    let mut taken_semester_idx = None;
    let mut status_idx = None;
    let mut observation_idx = None;

    for (idx, th) in table.select(&header_selector).enumerate() {
        let header = canonicalize(&element_text(&th));

        if header.contains("ano plan") || header.contains("año plan") {
            plan_year_idx = Some(idx);
        }
        if header.contains("sem plan") || header.contains("semestre plan") {
            plan_semester_idx = Some(idx);
        }
        if header.contains("cod asig") || header.contains("codigo") || header.contains("cod") {
            code_idx = Some(idx);
        }
        if header == "nombre" {
            name_idx = Some(idx);
        }
        if header.contains("credito") {
            credits_idx = Some(idx);
        }
        if header.contains("calificacion") || header.contains("nota") {
            grade_idx = Some(idx);
        }
        if header.contains("ano lectivo") || header.contains("año lectivo") {
            taken_year_idx = Some(idx);
        }
        if header.contains("sem lectivo") || header.contains("semestre lectivo") {
            taken_semester_idx = Some(idx);
        }
        if header.contains("estado") {
            status_idx = Some(idx);
        }
        if header.contains("observacion") {
            observation_idx = Some(idx);
        }
    }

    let mut subjects = Vec::new();
    for row in table.select(&row_selector) {
        let cells: Vec<String> = row
            .select(&cell_selector)
            .map(|cell| element_text(&cell))
            .collect();

        if cells.is_empty() {
            continue;
        }

        let mut resolved_grade_idx = grade_idx;
        let mut resolved_observation_idx = observation_idx;

        if cells.len() >= 9 {
            if plan_year_idx.is_none() {
                plan_year_idx = Some(0);
            }
            if plan_semester_idx.is_none() {
                plan_semester_idx = Some(1);
            }
            if code_idx.is_none() {
                code_idx = Some(2);
            }
            if name_idx.is_none() {
                name_idx = Some(3);
            }
            if credits_idx.is_none() {
                credits_idx = Some(4);
            }
            if taken_year_idx.is_none() {
                taken_year_idx = Some(6);
            }
            if taken_semester_idx.is_none() {
                taken_semester_idx = Some(7);
            }
            if grade_idx.is_none() {
                let left = cells.get(5).map(|value| value.as_str()).unwrap_or_default();
                let right = cells.get(8).map(|value| value.as_str()).unwrap_or_default();

                if looks_like_grade_value(left) && !looks_like_grade_value(right) {
                    resolved_grade_idx = Some(5);
                    if observation_idx.is_none() {
                        resolved_observation_idx = Some(8);
                    }
                } else {
                    resolved_grade_idx = Some(8);
                }
            }
        }

        subjects.push(SubjectRecord {
            plan_year: get_cell(&cells, plan_year_idx),
            plan_semester: get_cell(&cells, plan_semester_idx),
            code: get_cell(&cells, code_idx),
            name: get_cell(&cells, name_idx),
            credits: get_cell(&cells, credits_idx),
            grade: get_cell(&cells, resolved_grade_idx),
            taken_year: get_cell(&cells, taken_year_idx),
            taken_semester: get_cell(&cells, taken_semester_idx),
            status: get_cell(&cells, status_idx),
            observation: get_cell(&cells, resolved_observation_idx),
        });
    }

    Ok(subjects)
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

fn require_map_value(
    map: &HashMap<String, String>,
    key: &str,
    field: &'static str,
) -> Result<String, AvanceParserError> {
    let value = map.get(key).cloned().unwrap_or_default();
    require_non_empty(value, field)
}

fn require_non_empty(value: String, field: &'static str) -> Result<String, AvanceParserError> {
    if value.trim().is_empty() {
        return Err(AvanceParserError::MissingField(field));
    }

    Ok(value)
}

fn canonicalize(input: &str) -> String {
    input
        .trim()
        .to_lowercase()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ñ", "n")
        .replace(".", "")
        .replace("&", "")
}

fn element_text(element: &scraper::ElementRef<'_>) -> String {
    normalize_text(&element.text().collect::<Vec<_>>().join(" "))
}

fn normalize_text(input: &str) -> String {
    input.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn looks_like_grade_value(value: &str) -> bool {
    let normalized = canonicalize(value);

    if normalized.is_empty() {
        return false;
    }

    let token = normalized.split_whitespace().next().unwrap_or_default();
    if matches!(
        token,
        "a" | "b" | "c" | "d" | "f" | "s" | "p" | "r" | "i" | "n" | "np" | "na"
    ) {
        return true;
    }

    token.parse::<f64>().is_ok()
}
