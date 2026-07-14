FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY AnalyticsService.csproj NuGet.Config ./
RUN dotnet restore AnalyticsService.csproj --configfile NuGet.Config
COPY . ./
RUN dotnet publish AnalyticsService.csproj --configuration Release --output /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5001 DOTNET_EnableDiagnostics=0 PORT=5001
USER root
RUN apt-get update && apt-get install --yes --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=$APP_UID:$APP_UID /app/publish ./
USER $APP_UID
EXPOSE 5001
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 CMD ["curl", "--fail", "--silent", "--show-error", "http://127.0.0.1:5001/health"]
ENTRYPOINT ["dotnet", "AnalyticsService.dll"]
