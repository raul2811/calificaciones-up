Este es una propuesta para transformar tu README actual en uno mucho más visual, profesional y fácil de navegar. He añadido **badges**, una estructura más clara, **emojis** para mejorar la escaneabilidad y tablas para la configuración.

---

# 🎓 Calificaciones UP

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Rust](https://img.shields.io/badge/Rust-Axum-dea584?style=for-the-badge&logo=rust)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-AGPL--3.0-orange?style=for-the-badge)

**Calificaciones UP** es una plataforma web moderna diseñada para transformar la experiencia de consulta académica de los estudiantes de la **Universidad de Panamá**. Actúa como una capa de presentación optimizada sobre la Secretaría Virtual oficial, ofreciendo una interfaz clara, rápida y navegable.

[**Explorar Repositorio »**](https://github.com/raul2811/calificaciones-up)

---

## ✨ Características Principales

| Función | Descripción |
| :--- | :--- |
| **🚀 Dashboard Único** | Centraliza tu estado académico y financiero en una sola vista. |
| **📊 Analíticas** | Visualiza tu progreso por periodos y estadísticas de calificaciones. |
| **🔍 Seguimiento** | Filtra materias aprobadas, pendientes, observadas o reprobadas. |
| **👤 Perfil Completo** | Acceso rápido a tu foto de estudiante y resumen de expediente. |
| **💰 Finanzas** | Visibilidad clara sobre morosidad y estatus de pagos. |

---

## 🛠️ Stack Técnico

El proyecto está construido bajo una arquitectura de **monorepo**, separando responsabilidades para garantizar velocidad y escalabilidad.

- **Frontend:** `Next.js 15` + `React 19` + `Tailwind CSS v4`
- **Backend:** `Rust` + `Axum` (Alta eficiencia y seguridad de memoria)
- **Infraestructura:** `Docker` & `Docker Compose`
- **Lenguaje:** `TypeScript` para el cliente.

---

## 🏗️ Arquitectura del Proyecto

```text
calificaciones-up/
├── 📱 apps/
│   ├── web/          # Next.js App Router (Interfaz de usuario)
│   └── api/          # Rust Backend (Scraping y Consolidación)
├── 📄 docs/          # Documentación adicional
├── 🐳 Dockerfile     # Configuración de despliegue
└── ⚙️ compose.yaml   # Orquestación de servicios
```

---

## 🛡️ Seguridad y Alcance

> [!IMPORTANT]
> **Privacidad Primero:** Calificaciones-UP **no almacena tus credenciales**. El acceso es temporal y se utiliza exclusivamente para realizar un scraping seguro y controlado de los datos autorizados por el usuario en la plataforma oficial.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- **Node.js** 20+
- **Rust** & Cargo
- **Docker** (Opcional para despliegue local)

### Configuración Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Variables de Entorno:**
   Configura los archivos `.env` basándote en los ejemplos:
   * **Web:** `apps/web/.env.local`
   * **API:** `apps/api/.env`

3. **Ejecución en Desarrollo:**

   En terminales separadas:
   ```bash
   # Terminal 1: Frontend
   cd apps/web && npm run dev  # http://localhost:3000

   # Terminal 2: Backend
   cd apps/api && cargo run    # http://localhost:8081
   ```

---

## 🐳 Despliegue con Docker

La forma más rápida de poner el sistema en marcha es usando Docker Compose:

```bash
# 1. Copiar configuración de entorno
cp .env.compose.example .env

# 2. Levantar servicios
docker compose up --build
```

### Verificación de Salud (Health Checks)
```bash
curl http://localhost:8081/health
curl http://localhost:8081/ready
```

---

## ⚙️ Configuración (Variables de Entorno)

### Backend (Rust)
| Variable | Descripción |
| :--- | :--- |
| `API_ADDR` | Dirección de escucha del servidor (ej. `0.0.0.0:8081`) |
| `FRONTEND_ORIGIN` | URL del frontend para permitir CORS |
| `MATRICULA_BASE_URL` | URL base del sistema institucional |

### Frontend (Next.js)
| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | **Requerida.** URL pública del backend |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación |

---

## 📄 Licencia

Este proyecto es software libre y se distribuye bajo la licencia **GNU Affero General Public License v3.0**.

Copyright © 2026 [Raul Serrano](https://github.com/raul2811)

---
Para más detalles, visita el [repositorio oficial](https://github.com/raul2811/calificaciones-up).
