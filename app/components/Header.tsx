import {HStack} from "@navikt/ds-react";
import {NovariIKS} from "~/components/NovariIKS";

export default function Header() {
    return (
        <header>
            <HStack gap={"space-4"} align={"center"}>
                <NovariIKS width="150px" />
            <h1>Fint Analytics</h1>

                </HStack>
        </header>
    );
}