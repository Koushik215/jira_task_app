from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    groq_api_key: str = Field(default="", validation_alias=AliasChoices("GROQ_API_KEY"))
    jira_email: str = Field(default="", validation_alias=AliasChoices("JIRA_EMAIL"))
    jira_api_token: str = Field(default="", validation_alias=AliasChoices("JIRA_API_TOKEN"))
    jira_url: str = Field(default="", validation_alias=AliasChoices("JIRA_URL"))
    jira_enabled: bool = Field(default=False, validation_alias=AliasChoices("JIRA_ENABLED"))
    mysql_host: str = Field(default="localhost", validation_alias=AliasChoices("MYSQL_HOST", "MYSQLHOST"))
    mysql_port: int = Field(default=3306, validation_alias=AliasChoices("MYSQL_PORT", "MYSQLPORT"))
    mysql_user: str = Field(default="meeting_user", validation_alias=AliasChoices("MYSQL_USER", "MYSQLUSER"))
    mysql_password: str = Field(default="meeting_password", validation_alias=AliasChoices("MYSQL_PASSWORD", "MYSQLPASSWORD"))
    mysql_database: str = Field(default="meeting_intelligence", validation_alias=AliasChoices("MYSQL_DATABASE", "MYSQLDATABASE"))
    jira_project_key: str = Field(default="AIM", validation_alias=AliasChoices("JIRA_PROJECT_KEY"))
    default_user: str = Field(default="accountId_default", validation_alias=AliasChoices("DEFAULT_USER"))
    groq_model: str = Field(default="llama-3.1-8b-instant", validation_alias=AliasChoices("GROQ_MODEL"))

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
