#![allow(dead_code)]

use std::collections::HashMap;

use crate::domain::academic_progress::{
    AcademicProgress, AvanceAcademicData, CanonicalPeriodHistory, CanonicalSourceFlags,
    CanonicalSubjectRecord, MorosidadSummary, ProfessorRecord, SubjectGradeRecord, SubjectRecord,
};

#[derive(Debug, Clone)]
struct CandidateGrade {
    value: String,
    score: i32,
    academic_period_label: Option<String>,
    period_year: Option<String>,
    period_semester_type: Option<String>,
}

#[derive(Debug, Clone)]
struct CanonicalAccumulator {
    code: Option<String>,
    name: Option<String>,
    abbreviation: Option<String>,
    credits: Option<String>,
    plan_year: Option<String>,
    plan_semester: Option<String>,
    taken_year: Option<String>,
    taken_semester: Option<String>,
    observation: Option<String>,
    prerequisites: Option<String>,
    attempts_count: usize,
    source_flags: CanonicalSourceFlags,
    best_grade: Option<CandidateGrade>,
    period_history: Vec<CanonicalPeriodHistory>,
}

fn normalize(input: &str) -> String {
    input
        .trim()
        .to_lowercase()
        .replace('á', "a")
        .replace('é', "e")
        .replace('í', "i")
        .replace('ó', "o")
        .replace('ú', "u")
        .replace('ñ', "n")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

fn option_text(value: &Option<String>) -> Option<String> {
    value
        .as_ref()
        .map(|raw| raw.trim().to_string())
        .filter(|v| !v.is_empty())
}

fn canonical_key(code: &Option<String>, name: &Option<String>) -> Option<String> {
    let code = code.as_ref().map(|v| normalize(v)).unwrap_or_default();
    let name = name.as_ref().map(|v| normalize(v)).unwrap_or_default();

    if code.is_empty() && name.is_empty() {
        return None;
    }

    // Business rule: same subject name must consolidate even if code differs.
    // Fallback to code only when name is missing.
    if !name.is_empty() {
        return Some(format!("name:{}", name));
    }

    Some(format!("code:{}", code))
}

fn grade_score(grade: &str) -> i32 {
    let normalized = normalize(grade);

    if normalized.is_empty() {
        return -10_000;
    }

    if normalized.contains("pend") && normalized.contains("matric") {
        return 50;
    }

    if normalized.starts_with('a') {
        return 900;
    }
    if normalized.starts_with('b') {
        return 800;
    }
    if normalized.starts_with('c') {
        return 700;
    }
    if normalized.starts_with('d') {
        return 600;
    }
    if normalized.starts_with('f') || normalized.contains("reprob") {
        return 500;
    }
    if normalized.starts_with('s') {
        return 400;
    }
    if normalized.starts_with('n') {
        return 300;
    }
    if normalized.starts_with('x') || normalized.contains("profesor no ha entregado nota") {
        return 200;
    }

    if let Ok(number) = normalized.parse::<f64>() {
        return (number * 10.0) as i32;
    }

    100
}

fn derive_status(grade: &str) -> String {
    let normalized = normalize(grade);

    if normalized.is_empty() {
        return "Pendiente".to_string();
    }

    if normalized.contains("pend") && normalized.contains("matric") {
        return "Pendiente".to_string();
    }

    if normalized.starts_with('a') || normalized.starts_with('b') || normalized.starts_with('c') {
        return "Aprobada".to_string();
    }

    // Decision: D se clasifica como En observacion para respetar el criterio vigente del frontend.
    if normalized.starts_with('d') {
        return "En observacion".to_string();
    }

    if normalized.starts_with('f') || normalized.contains("reprob") {
        return "Reprobada".to_string();
    }

    if normalized.starts_with('s') {
        return "En observacion".to_string();
    }

    if normalized.starts_with('x') || normalized.contains("profesor no ha entregado nota") {
        return "En observacion".to_string();
    }

    if normalized.starts_with('n') {
        return "En observacion".to_string();
    }

    "Pendiente".to_string()
}

fn normalize_taken_semester(value: Option<String>) -> Option<String> {
    let raw = value?;
    let normalized = normalize(&raw);

    if normalized.contains("primer") {
        return Some("1".to_string());
    }
    if normalized.contains("segundo") {
        return Some("2".to_string());
    }
    if normalized.contains("anual") {
        return Some("A".to_string());
    }

    Some(raw)
}

fn semester_type_to_taken_semester(value: &Option<String>) -> Option<String> {
    let normalized = value
        .as_ref()
        .map(|v| normalize(v))
        .unwrap_or_default();

    if normalized.contains("primer") {
        return Some("1".to_string());
    }

    if normalized.contains("segundo") {
        return Some("2".to_string());
    }

    if normalized.contains("anual") {
        return Some("A".to_string());
    }

    None
}

fn maybe_set(target: &mut Option<String>, value: Option<String>) {
    if target.is_none() {
        *target = value;
    }
}

fn push_history(
    history: &mut Vec<CanonicalPeriodHistory>,
    label: Option<String>,
    year: Option<String>,
    sem_type: Option<String>,
    grade: Option<String>,
    points: Option<String>,
    index_value: Option<String>,
) {
    if label.is_none() && year.is_none() && sem_type.is_none() && grade.is_none() && points.is_none() && index_value.is_none() {
        return;
    }

    history.push(CanonicalPeriodHistory {
        academic_period_label: label,
        period_year: year,
        period_semester_type: sem_type,
        grade,
        points,
        index_value,
    });
}

fn candidate_from_grade(
    grade: Option<String>,
    academic_period_label: Option<String>,
    period_year: Option<String>,
    period_semester_type: Option<String>,
) -> Option<CandidateGrade> {
    let grade_value = grade?;
    let score = grade_score(&grade_value);

    Some(CandidateGrade {
        value: grade_value,
        score,
        academic_period_label,
        period_year,
        period_semester_type,
    })
}

fn absorb_candidate(acc: &mut CanonicalAccumulator, candidate: Option<CandidateGrade>) {
    let Some(candidate) = candidate else {
        return;
    };

    let replace = match &acc.best_grade {
        None => true,
        Some(best) => candidate.score > best.score,
    };

    if replace {
        acc.best_grade = Some(candidate);
    }
}

fn absorb_avance(acc: &mut CanonicalAccumulator, subject: &SubjectRecord) {
    acc.attempts_count += 1;
    acc.source_flags.from_avance = true;

    maybe_set(&mut acc.code, option_text(&subject.code));
    maybe_set(&mut acc.name, option_text(&subject.name));
    maybe_set(&mut acc.credits, option_text(&subject.credits));
    maybe_set(&mut acc.plan_year, option_text(&subject.plan_year));
    maybe_set(&mut acc.plan_semester, option_text(&subject.plan_semester));
    maybe_set(&mut acc.taken_year, option_text(&subject.taken_year));
    maybe_set(&mut acc.taken_semester, option_text(&subject.taken_semester));
    maybe_set(&mut acc.observation, option_text(&subject.observation));

    let candidate = candidate_from_grade(
        option_text(&subject.grade),
        None,
        option_text(&subject.taken_year),
        option_text(&subject.taken_semester),
    );
    absorb_candidate(acc, candidate);

    push_history(
        &mut acc.period_history,
        None,
        option_text(&subject.taken_year),
        option_text(&subject.taken_semester),
        option_text(&subject.grade),
        None,
        None,
    );
}

fn absorb_notas(acc: &mut CanonicalAccumulator, row: &SubjectGradeRecord) {
    acc.attempts_count += 1;
    acc.source_flags.from_notas_creditos_completos = true;

    maybe_set(&mut acc.code, option_text(&row.code));
    maybe_set(&mut acc.name, option_text(&row.name));
    maybe_set(&mut acc.abbreviation, option_text(&row.abbreviation));
    maybe_set(&mut acc.credits, option_text(&row.credits));
    maybe_set(&mut acc.taken_year, option_text(&row.period_year));
    maybe_set(
        &mut acc.taken_semester,
        semester_type_to_taken_semester(&row.period_semester_type).or_else(|| option_text(&row.period_semester_type)),
    );

    let candidate = candidate_from_grade(
        option_text(&row.grade),
        option_text(&row.academic_period_label),
        option_text(&row.period_year),
        option_text(&row.period_semester_type),
    );
    absorb_candidate(acc, candidate);

    push_history(
        &mut acc.period_history,
        option_text(&row.academic_period_label),
        option_text(&row.period_year),
        option_text(&row.period_semester_type),
        option_text(&row.grade),
        option_text(&row.points),
        option_text(&row.index_value),
    );
}

fn empty_accumulator() -> CanonicalAccumulator {
    CanonicalAccumulator {
        code: None,
        name: None,
        abbreviation: None,
        credits: None,
        plan_year: None,
        plan_semester: None,
        taken_year: None,
        taken_semester: None,
        observation: None,
        prerequisites: None,
        attempts_count: 0,
        source_flags: CanonicalSourceFlags {
            from_avance: false,
            from_notas_creditos_completos: false,
        },
        best_grade: None,
        period_history: Vec::new(),
    }
}

pub fn consolidate_academic_record(
    avance: AvanceAcademicData,
    notas_records: Vec<SubjectGradeRecord>,
    professors: Vec<ProfessorRecord>,
    morosidad: Option<MorosidadSummary>,
) -> AcademicProgress {
    let mut by_key: HashMap<String, CanonicalAccumulator> = HashMap::new();

    for subject in &avance.subjects {
        let key = canonical_key(&subject.code, &subject.name).unwrap_or_else(|| format!("avance:unknown:{}", by_key.len()));
        let entry = by_key.entry(key).or_insert_with(empty_accumulator);
        absorb_avance(entry, subject);
    }

    for row in &notas_records {
        let key = canonical_key(&row.code, &row.name).unwrap_or_else(|| format!("notas:unknown:{}", by_key.len()));
        let entry = by_key.entry(key).or_insert_with(empty_accumulator);
        absorb_notas(entry, row);
    }

    let mut subjects: Vec<CanonicalSubjectRecord> = by_key
        .into_values()
        .map(|acc| {
            let best_grade = acc.best_grade.as_ref().map(|value| value.value.clone());
            let derived_status = best_grade.as_ref().map(|grade| derive_status(grade));

            CanonicalSubjectRecord {
                code: acc.code,
                name: acc.name,
                abbreviation: acc.abbreviation,
                credits: acc.credits,
                grade: best_grade.clone(),
                best_grade: best_grade.clone(),
                status: derived_status.clone(),
                derived_status,
                plan_year: acc.plan_year,
                plan_semester: acc.plan_semester,
                taken_year: acc
                    .best_grade
                    .as_ref()
                    .and_then(|value| value.period_year.clone())
                    .or(acc.taken_year),
                taken_semester: normalize_taken_semester(acc
                    .best_grade
                    .as_ref()
                    .and_then(|value| value.period_semester_type.clone())
                    .or(acc.taken_semester)),
                attempts_count: acc.attempts_count,
                source_flags: acc.source_flags,
                observation: acc.observation,
                prerequisites: acc.prerequisites,
                academic_period_label: acc
                    .best_grade
                    .as_ref()
                    .and_then(|value| value.academic_period_label.clone()),
                period_history: acc.period_history,
            }
        })
        .collect();

    subjects.sort_by(|left, right| {
        let left_code = left.code.clone().unwrap_or_default();
        let right_code = right.code.clone().unwrap_or_default();

        left_code
            .cmp(&right_code)
            .then_with(|| left.name.clone().unwrap_or_default().cmp(&right.name.clone().unwrap_or_default()))
    });

    AcademicProgress {
        student: avance.student,
        subjects,
        professors,
        morosidad,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::academic_progress::{SubjectGradeRecord, SubjectRecord, StudentAcademicSummary};

    fn sample_student() -> StudentAcademicSummary {
        StudentAcademicSummary {
            name: "RAUL SERRANO".to_string(),
            career: "INGENIERIA".to_string(),
            plan: "0001".to_string(),
            current_index: "1.90".to_string(),
            current_year: "2026".to_string(),
            current_semester: "1".to_string(),
        }
    }

    #[test]
    fn merge_keeps_best_grade_across_attempts() {
        let avance = AvanceAcademicData {
            student: sample_student(),
            subjects: vec![SubjectRecord {
                plan_year: Some("1".to_string()),
                plan_semester: Some("2".to_string()),
                code: Some("10097".to_string()),
                name: Some("CALCULO INTEGRAL".to_string()),
                credits: Some("5".to_string()),
                grade: Some("F".to_string()),
                taken_year: Some("2022".to_string()),
                taken_semester: Some("2".to_string()),
                status: None,
                observation: None,
            }],
        };

        let notas = vec![
            SubjectGradeRecord {
                source: "notas_creditos_completos".to_string(),
                academic_period_label: Some("Segundo Semestre de 2022".to_string()),
                period_year: Some("2022".to_string()),
                period_semester_type: Some("segundo".to_string()),
                c_hor: None,
                abbreviation: None,
                code: Some("10097".to_string()),
                name: Some("CALCULO INTEGRAL".to_string()),
                num: None,
                credits: Some("5".to_string()),
                grade: Some("F".to_string()),
                points: None,
                index_value: None,
            },
            SubjectGradeRecord {
                source: "notas_creditos_completos".to_string(),
                academic_period_label: Some("Anuales de 2023".to_string()),
                period_year: Some("2023".to_string()),
                period_semester_type: Some("anual".to_string()),
                c_hor: None,
                abbreviation: None,
                code: Some("10097".to_string()),
                name: Some("CALCULO INTEGRAL".to_string()),
                num: None,
                credits: Some("5".to_string()),
                grade: Some("C".to_string()),
                points: None,
                index_value: None,
            },
        ];

        let merged = consolidate_academic_record(avance, notas, vec![], None);
        assert_eq!(merged.subjects.len(), 1);
        assert_eq!(merged.subjects[0].best_grade.as_deref(), Some("C"));
        assert_eq!(merged.subjects[0].grade.as_deref(), Some("C"));
    }

    #[test]
    fn merge_deduplicates_same_grade_records() {
        let avance = AvanceAcademicData {
            student: sample_student(),
            subjects: vec![],
        };

        let notas = vec![
            SubjectGradeRecord {
                source: "notas_creditos_completos".to_string(),
                academic_period_label: Some("Primer Semestre de 2024".to_string()),
                period_year: Some("2024".to_string()),
                period_semester_type: Some("primer".to_string()),
                c_hor: None,
                abbreviation: None,
                code: Some("10117".to_string()),
                name: Some("PROCESOS Y REDES ESTOCASTICAS".to_string()),
                num: None,
                credits: Some("4".to_string()),
                grade: Some("F".to_string()),
                points: None,
                index_value: None,
            },
            SubjectGradeRecord {
                source: "notas_creditos_completos".to_string(),
                academic_period_label: Some("Segundo Semestre de 2024".to_string()),
                period_year: Some("2024".to_string()),
                period_semester_type: Some("segundo".to_string()),
                c_hor: None,
                abbreviation: None,
                code: Some("10117".to_string()),
                name: Some("PROCESOS Y REDES ESTOCASTICAS".to_string()),
                num: None,
                credits: Some("4".to_string()),
                grade: Some("F".to_string()),
                points: None,
                index_value: None,
            },
        ];

        let merged = consolidate_academic_record(avance, notas, vec![], None);
        assert_eq!(merged.subjects.len(), 1);
        assert_eq!(merged.subjects[0].best_grade.as_deref(), Some("F"));
    }

    #[test]
    fn merge_keeps_subjects_present_only_in_notas() {
        let avance = AvanceAcademicData {
            student: sample_student(),
            subjects: vec![],
        };

        let notas = vec![SubjectGradeRecord {
            source: "notas_creditos_completos".to_string(),
            academic_period_label: Some("Primer Semestre de 2025".to_string()),
            period_year: Some("2025".to_string()),
            period_semester_type: Some("primer".to_string()),
            c_hor: None,
            abbreviation: Some("MAT".to_string()),
            code: Some("12345".to_string()),
            name: Some("ALGEBRA".to_string()),
            num: None,
            credits: Some("3".to_string()),
            grade: Some("B".to_string()),
            points: None,
            index_value: None,
        }];

        let merged = consolidate_academic_record(avance, notas, vec![], None);
        assert_eq!(merged.subjects.len(), 1);
        assert_eq!(merged.subjects[0].code.as_deref(), Some("12345"));
        assert_eq!(merged.subjects[0].best_grade.as_deref(), Some("B"));
        assert!(merged.subjects[0].source_flags.from_notas_creditos_completos);
    }

    #[test]
    fn merge_prefers_grade_from_notas_over_pending_from_avance() {
        let avance = AvanceAcademicData {
            student: sample_student(),
            subjects: vec![SubjectRecord {
                plan_year: Some("2".to_string()),
                plan_semester: Some("1".to_string()),
                code: Some("07462".to_string()),
                name: Some("INFORMATICA BASICA".to_string()),
                credits: Some("4".to_string()),
                grade: Some("PEND. por MATRICULAR".to_string()),
                taken_year: None,
                taken_semester: None,
                status: None,
                observation: None,
            }],
        };

        let notas = vec![SubjectGradeRecord {
            source: "notas_creditos_completos".to_string(),
            academic_period_label: Some("Primer Semestre de 2025".to_string()),
            period_year: Some("2025".to_string()),
            period_semester_type: Some("primer".to_string()),
            c_hor: None,
            abbreviation: Some("INF".to_string()),
            code: Some("07462".to_string()),
            name: Some("INFORMATICA BASICA".to_string()),
            num: None,
            credits: Some("4".to_string()),
            grade: Some("C".to_string()),
            points: None,
            index_value: None,
        }];

        let merged = consolidate_academic_record(avance, notas, vec![], None);
        assert_eq!(merged.subjects.len(), 1);
        assert_eq!(merged.subjects[0].best_grade.as_deref(), Some("C"));
        assert_eq!(merged.subjects[0].status.as_deref(), Some("Aprobada"));
    }

    #[test]
    fn merge_deduplicates_same_name_even_if_code_differs_between_sources() {
        let avance = AvanceAcademicData {
            student: sample_student(),
            subjects: vec![SubjectRecord {
                plan_year: Some("3".to_string()),
                plan_semester: Some("2".to_string()),
                code: Some("10097".to_string()),
                name: Some("CALCULO INTEGRAL".to_string()),
                credits: Some("5".to_string()),
                grade: Some("PEND. por MATRICULAR".to_string()),
                taken_year: None,
                taken_semester: None,
                status: None,
                observation: None,
            }],
        };

        let notas = vec![SubjectGradeRecord {
            source: "notas_creditos_completos".to_string(),
            academic_period_label: Some("Anuales de 2023".to_string()),
            period_year: Some("2023".to_string()),
            period_semester_type: Some("anual".to_string()),
            c_hor: None,
            abbreviation: None,
            code: Some("99999".to_string()),
            name: Some("CALCULO INTEGRAL".to_string()),
            num: None,
            credits: Some("5".to_string()),
            grade: Some("C".to_string()),
            points: None,
            index_value: None,
        }];

        let merged = consolidate_academic_record(avance, notas, vec![], None);
        assert_eq!(merged.subjects.len(), 1);
        assert_eq!(merged.subjects[0].best_grade.as_deref(), Some("C"));
    }
}
