import type { ObligationResponse } from "@repo/types";
import { ObligationDashboard } from "../components/obligations/obligation-dashboard";
import { listObligations, toApiError } from "../api/obligations";
import { dictionaries, getLocale } from "../i18n";
import type { HomePageProps } from "../interfaces/app";
import type { ApiError } from "../types/api";
import {
  readOptionalParam,
  readStatusParam,
  readSuccessParam,
} from "../utils/search-params";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const locale = getLocale(params.locale);
  const dictionary = dictionaries[locale];
  const query = readOptionalParam(params.q);
  const status = readStatusParam(params.status);
  const errorMessage = readOptionalParam(params.error);
  const successType = readSuccessParam(params.success);
  const successNotification = successType
    ? dictionary.notifications[successType]
    : undefined;
  let obligations: ObligationResponse[] = [];
  let apiError: ApiError | undefined;

  try {
    obligations = await listObligations();
  } catch (error) {
    apiError = toApiError(error);
  }

  return (
    <ObligationDashboard
      apiError={apiError}
      dictionary={dictionary}
      errorMessage={errorMessage}
      locale={locale}
      obligations={obligations}
      query={query}
      status={status}
      successNotification={successNotification}
    />
  );
}
