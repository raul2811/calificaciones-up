#![allow(dead_code)]

use crate::domain::academic_progress::ProfessorRecord;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfessorsParserError;

pub trait ProfessorsParser: Send + Sync {
    fn parse(&self, html: &str) -> Result<Vec<ProfessorRecord>, ProfessorsParserError>;
}
