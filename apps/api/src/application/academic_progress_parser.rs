#![allow(dead_code)]

use crate::domain::academic_progress::AvanceAcademicData;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AcademicProgressParserError;

pub trait AcademicProgressParser: Send + Sync {
    fn parse(&self, html: &str) -> Result<AvanceAcademicData, AcademicProgressParserError>;
}
