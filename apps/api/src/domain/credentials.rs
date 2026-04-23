#![allow(dead_code)]

use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RemoteLoginCredentials {
    pub provincia: Provincia,
    pub clase: Clase,
    pub tomo: Tomo,
    pub folio: Folio,
    pub password: Password,
}

impl RemoteLoginCredentials {
    pub fn try_new(
        provincia: &str,
        clase: &str,
        tomo: &str,
        folio: &str,
        password: &str,
    ) -> Result<Self, CredentialValidationError> {
        Ok(Self {
            provincia: Provincia::try_from(provincia)?,
            clase: Clase::try_from(clase)?,
            tomo: Tomo::try_from(tomo)?,
            folio: Folio::try_from(folio)?,
            password: Password::try_from(password)?,
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CredentialValidationError {
    InvalidProvincia,
    InvalidClase,
    InvalidTomo,
    InvalidFolio,
    MissingPassword,
}

impl Display for CredentialValidationError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidProvincia => write!(f, "Provincia invalida."),
            Self::InvalidClase => write!(f, "Clase invalida."),
            Self::InvalidTomo => write!(f, "Tomo debe ser numerico y tener maximo 4 caracteres."),
            Self::InvalidFolio => write!(f, "Folio debe ser numerico y tener maximo 6 caracteres."),
            Self::MissingPassword => write!(f, "Password es requerido."),
        }
    }
}

impl std::error::Error for CredentialValidationError {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Provincia {
    P00,
    P01,
    P02,
    P03,
    P04,
    P05,
    P06,
    P07,
    P08,
    P09,
    P10,
    P11,
    P12,
    P13,
    P14,
    P15,
}

impl Provincia {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::P00 => "00",
            Self::P01 => "01",
            Self::P02 => "02",
            Self::P03 => "03",
            Self::P04 => "04",
            Self::P05 => "05",
            Self::P06 => "06",
            Self::P07 => "07",
            Self::P08 => "08",
            Self::P09 => "09",
            Self::P10 => "10",
            Self::P11 => "11",
            Self::P12 => "12",
            Self::P13 => "13",
            Self::P14 => "14",
            Self::P15 => "15",
        }
    }
}

impl TryFrom<&str> for Provincia {
    type Error = CredentialValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "00" => Ok(Self::P00),
            "01" => Ok(Self::P01),
            "02" => Ok(Self::P02),
            "03" => Ok(Self::P03),
            "04" => Ok(Self::P04),
            "05" => Ok(Self::P05),
            "06" => Ok(Self::P06),
            "07" => Ok(Self::P07),
            "08" => Ok(Self::P08),
            "09" => Ok(Self::P09),
            "10" => Ok(Self::P10),
            "11" => Ok(Self::P11),
            "12" => Ok(Self::P12),
            "13" => Ok(Self::P13),
            "14" => Ok(Self::P14),
            "15" => Ok(Self::P15),
            _ => Err(CredentialValidationError::InvalidProvincia),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Clase {
    C00,
    N,
    E,
    Ec,
    Pe,
    Av,
    Pi,
}

impl Clase {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::C00 => "00",
            Self::N => "N",
            Self::E => "E",
            Self::Ec => "EC",
            Self::Pe => "PE",
            Self::Av => "AV",
            Self::Pi => "PI",
        }
    }
}

impl TryFrom<&str> for Clase {
    type Error = CredentialValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "00" => Ok(Self::C00),
            "N" => Ok(Self::N),
            "E" => Ok(Self::E),
            "EC" => Ok(Self::Ec),
            "PE" => Ok(Self::Pe),
            "AV" => Ok(Self::Av),
            "PI" => Ok(Self::Pi),
            _ => Err(CredentialValidationError::InvalidClase),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Tomo(String);

impl Tomo {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<&str> for Tomo {
    type Error = CredentialValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        if value.is_empty() || value.len() > 4 || !value.chars().all(|ch| ch.is_ascii_digit()) {
            return Err(CredentialValidationError::InvalidTomo);
        }

        Ok(Self(value.to_string()))
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Folio(String);

impl Folio {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl TryFrom<&str> for Folio {
    type Error = CredentialValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        if value.is_empty() || value.len() > 6 || !value.chars().all(|ch| ch.is_ascii_digit()) {
            return Err(CredentialValidationError::InvalidFolio);
        }

        Ok(Self(value.to_string()))
    }
}

#[derive(Clone, PartialEq, Eq)]
pub struct Password(String);

impl Password {
    pub fn expose_secret(&self) -> &str {
        &self.0
    }
}

impl TryFrom<&str> for Password {
    type Error = CredentialValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        if value.trim().is_empty() {
            return Err(CredentialValidationError::MissingPassword);
        }

        Ok(Self(value.to_string()))
    }
}

impl std::fmt::Debug for Password {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str("[REDACTED_PASSWORD]")
    }
}

impl Display for Password {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str("[REDACTED_PASSWORD]")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn provincia_accepts_all_allowed_values() {
        let allowed = [
            "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13",
            "14", "15",
        ];

        for value in allowed {
            let provincia = Provincia::try_from(value).expect("must be valid provincia");
            assert_eq!(provincia.as_str(), value);
        }
    }

    #[test]
    fn provincia_rejects_invalid_values() {
        assert_eq!(
            Provincia::try_from("16").unwrap_err(),
            CredentialValidationError::InvalidProvincia
        );
        assert_eq!(
            Provincia::try_from("AA").unwrap_err(),
            CredentialValidationError::InvalidProvincia
        );
    }

    #[test]
    fn clase_accepts_all_allowed_values() {
        let allowed = ["00", "N", "E", "EC", "PE", "AV", "PI"];

        for value in allowed {
            let clase = Clase::try_from(value).expect("must be valid clase");
            assert_eq!(clase.as_str(), value);
        }
    }

    #[test]
    fn clase_rejects_invalid_values() {
        assert_eq!(
            Clase::try_from("X").unwrap_err(),
            CredentialValidationError::InvalidClase
        );
    }

    #[test]
    fn tomo_enforces_numeric_and_max_len_4() {
        assert_eq!(Tomo::try_from("1234").unwrap().as_str(), "1234");
        assert_eq!(
            Tomo::try_from("12A").unwrap_err(),
            CredentialValidationError::InvalidTomo
        );
        assert_eq!(
            Tomo::try_from("12345").unwrap_err(),
            CredentialValidationError::InvalidTomo
        );
    }

    #[test]
    fn folio_enforces_numeric_and_max_len_6() {
        assert_eq!(Folio::try_from("123456").unwrap().as_str(), "123456");
        assert_eq!(
            Folio::try_from("12A").unwrap_err(),
            CredentialValidationError::InvalidFolio
        );
        assert_eq!(
            Folio::try_from("1234567").unwrap_err(),
            CredentialValidationError::InvalidFolio
        );
    }

    #[test]
    fn password_is_required() {
        assert_eq!(
            Password::try_from("").unwrap_err(),
            CredentialValidationError::MissingPassword
        );
        assert_eq!(
            Password::try_from("   ").unwrap_err(),
            CredentialValidationError::MissingPassword
        );
    }

    #[test]
    fn password_is_redacted_in_debug_and_display() {
        let password = Password::try_from("secret").unwrap();

        assert_eq!(format!("{}", password), "[REDACTED_PASSWORD]");
        assert_eq!(format!("{:?}", password), "[REDACTED_PASSWORD]");
        assert_eq!(password.expose_secret(), "secret");
    }

    #[test]
    fn remote_credentials_validates_all_fields() {
        let credentials =
            RemoteLoginCredentials::try_new("06", "00", "0723", "00584", "secret").unwrap();

        assert_eq!(credentials.provincia.as_str(), "06");
        assert_eq!(credentials.clase.as_str(), "00");
        assert_eq!(credentials.tomo.as_str(), "0723");
        assert_eq!(credentials.folio.as_str(), "00584");
        assert_eq!(credentials.password.expose_secret(), "secret");
    }

    #[test]
    fn remote_credentials_fails_fast_on_invalid_input() {
        let err =
            RemoteLoginCredentials::try_new("99", "00", "0723", "00584", "secret").unwrap_err();
        assert_eq!(err, CredentialValidationError::InvalidProvincia);
    }
}
