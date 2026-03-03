import type {Route} from "./+types/home";
import {Box, Button, HGrid, HStack, InfoCard, Popover, Table} from "@navikt/ds-react";
import {useLoaderData} from "react-router";
import {
  type AnalyticsEvent,
  getLatestEvents,
  type TotalEventsPerAppWithTypesRow,
  type TotalEventsPerTenantRow,
} from "~/server/analytics.repo";
import {type MouseEvent, type ReactElement, useState} from "react";
import {
  ExclamationmarkTriangleIcon,
  FileCodeIcon,
  FingerButtonIcon,
  MagnifyingGlassCheckmarkIcon,
} from "@navikt/aksel-icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Novari Analytics" },
    { name: "description", content: "Novari Analytics" },
  ];
}

export const loader = async () => {
  const rows = await getLatestEvents(50);
  // const totalEventsPerApp = await getTotalEventsPerAppWithTypes({
  //   from: new Date("2021-01-01"),
  //   to: new Date(),
  // });
  // const totalEventsPerTenant = await getTotalEventsPerTenant({
  //   from: new Date("2021-01-01"),
  //   to: new Date(),
  // });

  const totalEventsPerApp: never[] = [];
  const totalEventsPerTenant: never[] = [];

  return { rows, totalEventsPerApp, totalEventsPerTenant };
};

export default function Home() {
  const { rows, totalEventsPerApp, totalEventsPerTenant } = useLoaderData<{
    rows: AnalyticsEvent[];
    totalEventsPerApp: TotalEventsPerAppWithTypesRow[];
    totalEventsPerTenant: TotalEventsPerTenantRow[];
  }>();

  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverToggle = (
    event: MouseEvent<HTMLButtonElement>,
    rowId: number,
  ) => {
    if (openPopoverId === rowId) {
      setOpenPopoverId(null);
      setAnchorEl(null);
      return;
    }

    setAnchorEl(event.currentTarget);
    setOpenPopoverId(rowId);
  };

  const handlePopoverClose = () => {
    setOpenPopoverId(null);
    setAnchorEl(null);
  };

  const getTypeIcon = (
    type: string,
    fontSize = "1.5rem",
  ): ReactElement => {
    switch (type) {
      case "page_view":
        return (
          <FileCodeIcon
            aria-hidden
            fontSize={fontSize}
            color="var(--ax-bg-success-strong)"
          />
        );
      case "button_click":
        return (
          <FingerButtonIcon
            aria-hidden
            fontSize={fontSize}
            color="var(--ax-bg-brand-blue-strong)"
          />
        );
      case "search":
        return (
          <MagnifyingGlassCheckmarkIcon
            aria-hidden
            fontSize={fontSize}
            color="var(--ax-bg-meta-purple-strong)"
          />
        );
      default:
        return <ExclamationmarkTriangleIcon aria-hidden fontSize={fontSize} color="var(--ax-bg-danger-strong)"/>;
    }
  };

  return (
    <>
      <h1>Analytics events</h1>

      <HGrid columns={3} gap="space-24" margin="space-24" >
        {totalEventsPerApp.map((row) => (
            <InfoCard key={row.app} data-color="info" >
              <InfoCard.Header>
                <InfoCard.Title>{row.app}</InfoCard.Title>
              </InfoCard.Header>

              <InfoCard.Content>
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                  {row.total_events} events
                </div>

                {/*{row.by_type.length > 0 && (*/}
                {/*    <List>*/}
                {/*      {row.by_type.map((t) => (*/}
                {/*            <List.Item icon={getTypeIcon(t.type, "1.125rem")} key={t.type}>*/}
                {/*              {t.events}: {t.type}*/}
                {/*            </List.Item>*/}

                {/*      ))}*/}
                {/*    </List>*/}
                {/*)}*/}
              </InfoCard.Content>
            </InfoCard>
        ))}
      </HGrid>

      <HGrid columns={3} gap="space-24" margin={"space-24"} >
        {totalEventsPerTenant.map((row) => (
          <InfoCard key={row.tenant} data-color="neutral">
            <InfoCard.Header>
              <InfoCard.Title>{row.tenant ?? "Unknown"}</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>{row.events} events</InfoCard.Content>
          </InfoCard>
        ))}
      </HGrid>

      <Box>
        <Table zebraStripes={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>App</Table.HeaderCell>
              <Table.HeaderCell>Path</Table.HeaderCell>
              <Table.HeaderCell>Element</Table.HeaderCell>
              <Table.HeaderCell>Tenant</Table.HeaderCell>
              <Table.HeaderCell>Meta</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.DataCell>
                  <HStack gap={"space-2"} align={"center"}>
                  {getTypeIcon(row.type)}
                  {row.type}
                  </HStack>
                </Table.DataCell>
                <Table.DataCell>
                  {new Date(row.ts).toLocaleString()}
                </Table.DataCell>
                <Table.DataCell>{row.app}</Table.DataCell>
                <Table.DataCell>{row.path ?? "-"}</Table.DataCell>
                <Table.DataCell>{row.element ?? "-"}</Table.DataCell>
                <Table.DataCell>{row.tenant ?? "-"}</Table.DataCell>
                <Table.DataCell>
                  {row.meta && (
                    <>
                      <Popover
                        open={openPopoverId === row.id}
                        onClose={handlePopoverClose}
                        anchorEl={anchorEl}
                        id={row.id.toString()}
                      >
                        <Popover.Content>
                          {row.meta ? JSON.stringify(row.meta) : "-"}
                        </Popover.Content>
                      </Popover>
                      <Button
                        onClick={(event) => handlePopoverToggle(event, row.id)}
                        aria-expanded={openPopoverId === row.id}
                        aria-controls={
                          openPopoverId === row.id ? row.id.toString() : undefined
                        }
                        size={"small"}
                        variant={"tertiary"}
                      >
                        View
                      </Button>
                    </>
                  )}
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Box>
    </>
  );
}
