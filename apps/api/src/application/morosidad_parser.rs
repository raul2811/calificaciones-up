#![allow(dead_code)]

use crate::domain::academic_progress::MorosidadSummary;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MorosidadParserError;

pub trait MorosidadParser: Send + Sync {
    fn parse(&self, html: &str) -> Result<MorosidadSummary, MorosidadParserError>;
}
