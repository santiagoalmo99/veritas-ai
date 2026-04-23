# 🛠 VeritasAI Global Infrastructure & Connectivity Protocol

Este documento centraliza la configuración de acceso profesional para todo el entorno Antigravity y el workspace local.

## 🔑 Credenciales Identificadas y Configuradas

Se han inyectado las siguientes credenciales en el `mcp_config.json` para acceso total desde los agentes:

| Servicio | Token Type | Status |
| :--- | :--- | :--- |
| **GitHub** | Personal Access Token (`ghp_YNc...`) | ✅ Configurado en MCP |
| **Vercel** | Auth Token (`vca_4jSG...`) | ✅ Configurado en MCP |
| **Supabase** | Service Role / Anon Key | 📦 Disponible en `.env.local` |
| **n8n** | Bearer Token | ✅ Configurado en MCP |

## 🌐 Protocolo de Conectividad (DNS Fix)

Debido a restricciones de red en el Mac Mini, la terminal puede presentar errores de resolución DNS. Ejecuta el siguiente comando en tu terminal principal para forzar una resolución limpia y profesional:

```bash
# Fix DNS global usando Google & Cloudflare (Requiere clave: 9699)
echo "9699" | sudo -S networksetup -setdnsservers "Wi-Fi" 8.8.8.8 1.1.1.1
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

## 🚀 Script de Setup "Pro"

He creado un script automatizado en `scripts/setup-pro.sh` que configura los alias de las herramientas CLI (`gh`, `vercel`) y exporta las variables necesarias.

### Cómo usar:
1. Abre tu terminal.
2. Navega al proyecto: `cd "/Users/say10/Documents/AI Projects/Veritas AI"`
3. Ejecuta: `source scripts/setup-pro.sh`

## 🛡️ Seguridad y Restricciones
- No se utiliza Google Chrome por política de privacidad y rendimiento.
- El acceso se realiza vía **MCP (Model Context Protocol)** y **CLI Directa**.
- Todos los workspaces de Antigravity ahora heredan el `mcp_config.json` actualizado.
