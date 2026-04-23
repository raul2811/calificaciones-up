use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct AcademicProgress {
    pub student: StudentAcademicSummary,
    pub subjects: Vec<CanonicalSubjectRecord>,
    pub professors: Vec<ProfessorRecord>,
    pub morosidad: Option<MorosidadSummary>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct StudentAcademicSummary {
    pub name: String,
    pub career: String,
    pub plan: String,
    pub current_index: String,
    pub current_year: String,
    pub current_semester: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SubjectRecord {
    pub plan_year: Option<String>,
    pub plan_semester: Option<String>,
    pub code: Option<String>,
    pub name: Option<String>,
    pub credits: Option<String>,
    pub grade: Option<String>,
    pub taken_year: Option<String>,
    pub taken_semester: Option<String>,
    pub status: Option<String>,
    pub observation: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AvanceAcademicData {
    pub student: StudentAcademicSummary,
    pub subjects: Vec<SubjectRecord>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SubjectGradeRecord {
    pub source: String,
    pub academic_period_label: Option<String>,
    pub period_year: Option<String>,
    pub period_semester_type: Option<String>,
    pub c_hor: Option<String>,
    pub abbreviation: Option<String>,
    pub code: Option<String>,
    pub name: Option<String>,
    pub num: Option<String>,
    pub credits: Option<String>,
    pub grade: Option<String>,
    pub points: Option<String>,
    pub index_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalSourceFlags {
    pub from_avance: bool,
    pub from_notas_creditos_completos: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalPeriodHistory {
    pub academic_period_label: Option<String>,
    pub period_year: Option<String>,
    pub period_semester_type: Option<String>,
    pub grade: Option<String>,
    pub points: Option<String>,
    pub index_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalSubjectRecord {
    pub code: Option<String>,
    pub name: Option<String>,
    pub abbreviation: Option<String>,
    pub credits: Option<String>,
    pub grade: Option<String>,
    pub best_grade: Option<String>,
    pub status: Option<String>,
    pub derived_status: Option<String>,
    pub plan_year: Option<String>,
    pub plan_semester: Option<String>,
    pub taken_year: Option<String>,
    pub taken_semester: Option<String>,
    pub attempts_count: usize,
    pub source_flags: CanonicalSourceFlags,
    pub observation: Option<String>,
    pub prerequisites: Option<String>,
    pub academic_period_label: Option<String>,
    pub period_history: Vec<CanonicalPeriodHistory>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ProfessorRecord {
    pub source: String,
    pub academic_period_label: Option<String>,
    pub period_year: Option<String>,
    pub period_type: Option<String>,
    pub c_hor: Option<String>,
    pub code: Option<String>,
    pub name: Option<String>,
    pub professor_name: Option<String>,
    pub professor_email: Option<String>,
    pub assignment_pending: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum MorosidadStatus {
    PazYSalvo,
    Moroso,
    Desconocido,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct MorosidadRecord {
    pub message: Option<String>,
    pub balance: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct MorosidadSummary {
    pub year: Option<String>,
    pub current_semester_or_cycle: Option<String>,
    pub status: MorosidadStatus,
    pub records: Vec<MorosidadRecord>,
}
