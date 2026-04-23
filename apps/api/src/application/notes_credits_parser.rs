#![allow(dead_code)]

use crate::domain::academic_progress::SubjectGradeRecord;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NotesCreditsParserError;

pub trait NotesCreditsParser: Send + Sync {
    fn parse(&self, html: &str) -> Result<Vec<SubjectGradeRecord>, NotesCreditsParserError>;
}
