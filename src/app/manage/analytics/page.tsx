import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import InsightsIcon from "@mui/icons-material/Insights";
import { PageContainer } from "@/components/PageContainer";
import { BackButton } from "@/components/BackButton";
import { PageTitle } from "@/components/PageTitle";
import { AnalyticsDailyChart } from "@/components/AnalyticsDailyChart";
import { executeGraphQL } from "@/lib/graphql-server";
import { EVENT_OPTIONS_QUERY } from "@/lib/queries/events";
import {
  getAnalyticsSummary,
  type AnalyticsDimension,
  type RankedRow,
} from "@/lib/vercel-analytics";
import { analyticsBarSx } from "@/lib/analytics-style";

// The free (Hobby) plan keeps one month of data.
const PERIODS = [7, 30] as const;

const numberFormat = new Intl.NumberFormat("pt-PT");
const countryNames = new Intl.DisplayNames(["pt-PT"], { type: "region" });

const PAGE_NAMES: Record<string, string> = {
  "/": "Início",
  "/events": "Eventos",
  "/history": "Historial",
  "/contacts": "Contactos",
};
const DEVICE_NAMES: Record<string, string> = {
  desktop: "Computador",
  mobile: "Telemóvel",
  tablet: "Tablet",
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 }}>
        {numberFormat.format(value)}
      </Typography>
    </Card>
  );
}

/** A "top N" list: name, a thin bar for the share of page views, and the count. */
function RankedList({
  title,
  rows,
  label,
}: {
  title: string;
  rows: RankedRow[];
  label: (key: string) => string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.pageviews));
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Typography component="h2" sx={{ fontWeight: 600, mb: 1.5 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Sem dados neste período.
        </Typography>
      ) : (
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead" sx={visuallyHidden}>
            <tr>
              <th>Nome</th>
              <th>Visualizações</th>
            </tr>
          </Box>
          <tbody>
            {rows.map((row) => (
              <Box component="tr" key={row.key}>
                <Box component="td" sx={{ py: 0.75, pr: 2, width: "100%" }}>
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {label(row.key)}
                  </Typography>
                  <Box
                    aria-hidden
                    sx={{
                      ...analyticsBarSx,
                      mt: 0.5,
                      height: 4,
                      borderRadius: 2,
                      width: `${Math.max(2, (row.pageviews / max) * 100)}%`,
                    }}
                  />
                </Box>
                <Box
                  component="td"
                  sx={{ py: 0.75, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {numberFormat.format(row.pageviews)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </tbody>
        </Box>
      )}
    </Card>
  );
}

const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

function NotConfigured() {
  return (
    <Alert severity="info">
      <AlertTitle>Estatísticas ainda não configuradas</AlertTitle>
      <ol style={{ margin: 0, paddingLeft: "1.25rem" }}>
        <li>No Vercel, abra o projeto → Analytics → Enable.</li>
        <li>
          Crie um token em vercel.com/account/settings/tokens (âmbito: a equipa do projeto, com
          data de expiração).
        </li>
        <li>
          Em Settings → Environment Variables, adicione <code>VERCEL_ANALYTICS_TOKEN</code> (tipo
          Secret) e <code>VERCEL_ANALYTICS_TEAM_ID</code>, e faça redeploy.
        </li>
      </ol>
    </Alert>
  );
}

export default async function ManageAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const requested = Number((await searchParams).days);
  const days = PERIODS.find((period) => period === requested) ?? 7;
  const result = await getAnalyticsSummary(days);

  let eventTitles = new Map<string, string>();
  if (result.status === "ok") {
    const { events } = await executeGraphQL<{ events: { id: string; title: string }[] }>(
      EVENT_OPTIONS_QUERY,
    );
    eventTitles = new Map(events.map((event) => [event.id, event.title]));
  }

  const labels: Record<AnalyticsDimension, (key: string) => string> = {
    requestPath: (path) => {
      if (PAGE_NAMES[path]) return PAGE_NAMES[path];
      const eventId = path.match(/^\/events\/([^/]+)$/)?.[1];
      if (eventId) return `Evento: ${eventTitles.get(eventId) ?? "(eliminado)"}`;
      return path === "Others" ? "Outras" : path;
    },
    country: (code) => {
      if (code === "Others") return "Outros";
      try {
        return code ? (countryNames.of(code) ?? code) : "Desconhecido";
      } catch {
        return code;
      }
    },
    deviceType: (type) => DEVICE_NAMES[type] ?? (type === "Others" ? "Outros" : type || "Desconhecido"),
  };

  return (
    <PageContainer maxWidth="md">
      <BackButton href="/manage" />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <PageTitle icon={<InsightsIcon />}>Estatísticas</PageTitle>
        <ButtonGroup size="small" aria-label="Período">
          {PERIODS.map((period) => (
            <Button
              key={period}
              href={`/manage/analytics?days=${period}`}
              variant={period === days ? "contained" : "outlined"}
              aria-current={period === days ? "true" : undefined}
            >
              {period} dias
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {result.status === "not-configured" && <NotConfigured />}

      {result.status === "error" && (
        <Alert severity="error">
          <AlertTitle>Não foi possível obter as estatísticas</AlertTitle>
          {result.httpStatus === 401 || result.httpStatus === 403
            ? "O Vercel recusou o token. Confirme VERCEL_ANALYTICS_TOKEN e VERCEL_ANALYTICS_TEAM_ID (o token pode ter expirado)."
            : result.httpStatus === 402
              ? "O plano atual do Vercel não permite consultar estas estatísticas por API. Pode vê-las no painel do Vercel → Analytics."
              : "Tente novamente daqui a alguns minutos."}
          {result.httpStatus && ` (erro ${result.httpStatus})`}
        </Alert>
      )}

      {result.status === "ok" && (
        <>
          <Typography color="text.secondary">
            Visitas ao site público nos últimos {days} dias (as páginas de gestão não contam).
            Atualizado a cada 10 minutos.
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
            <StatTile label="Visitantes" value={result.summary.totals.visitors} />
            <StatTile label="Visualizações de páginas" value={result.summary.totals.pageviews} />
          </Box>

          <Card variant="outlined" sx={{ p: 2.5 }}>
            <Typography component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              Visualizações por dia
            </Typography>
            <AnalyticsDailyChart rows={result.summary.daily} />
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <RankedList title="Páginas mais vistas" rows={result.summary.top.requestPath} label={labels.requestPath} />
            <RankedList title="Países" rows={result.summary.top.country} label={labels.country} />
            <RankedList title="Dispositivos" rows={result.summary.top.deviceType} label={labels.deviceType} />
          </Box>
        </>
      )}
    </PageContainer>
  );
}
