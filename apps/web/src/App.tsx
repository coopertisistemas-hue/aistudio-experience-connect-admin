import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/providers/AuthProvider";
import { TenantProvider } from "@connect/ui";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

function TenantProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <TenantProvider supabase={supabase} user={user}>
      {children}
    </TenantProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <TenantProviderWrapper>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </TenantProviderWrapper>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
