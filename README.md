# Docker MCP Server

Servidor MCP para controlar Docker con lenguaje natural usando Cline y modelos gratuitos.

## Instalación

```bash
npm install
```

## Configuración

### 1. Instalar Cline en VS Code
- Abre VS Code
- Ve a Extensiones (Ctrl+Shift+X)
- Busca "Cline" e instálalo

### 2. Configurar modelo gratuito
Crea/edita `%USERPROFILE%\.continue\config.json`:

```json
{
  "models": [
    {
      "title": "Kat Coder Pro",
      "provider": "openai",
      "model": "kat-coder-pro",
      "apiBase": "https://api.kat.ai/v1"
    }
  ],
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["C:\\Users\\Rodri\\OneDrive\\Desktop\\Docker-MCP\\index.js"]
    }
  }
}
```

### 3. Configurar Cline MCP
En VS Code, abre Cline → Settings → MCP Servers y pega:

```json
{
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["C:\\Users\\Rodri\\OneDrive\\Desktop\\Docker-MCP\\index.js"]
    }
  }
}
```

## Uso

1. Abre Cline en VS Code
2. Escribe comandos en lenguaje natural

## Herramientas disponibles

- **create_containers**: Crea múltiples contenedores Docker
- **list_containers**: Lista todos los contenedores activos
- **delete_container**: Elimina un contenedor por nombre

## Ejemplos de prompts

- "Crea 3 contenedores de nginx en el puerto 8080"
- "Lista todos los contenedores"
- "Elimina el contenedor ai_container_0"
- "Crea 2 contenedores de redis en el puerto 6379"

## Requisitos

- Node.js instalado
- Docker Desktop ejecutándose
- VS Code con extensión Cline
