import { useRouter } from 'expo-router';

const ROUTES = {
  Login: '/',
  Cadastro: '/cadastro',
  Home: '/home',
  Dashboard: '/dashboard',
  Clients: '/clients',
  ClientDetails: '/client-details',
  Recommendations: '/recommendations',
  Prediction: '/prediction',
  Profiles: '/profiles',
};

function normalizeParams(params) {
  if (!params) return undefined;
  if (params.client) return { id: String(params.client.id) };
  return params;
}

export default function useRouterNavigation() {
  const router = useRouter();

  function go(method, screenName, params) {
    const pathname = ROUTES[screenName] || screenName;
    const normalizedParams = normalizeParams(params);
    router[method]({ pathname, params: normalizedParams });
  }

  return {
    navigate: (screenName, params) => go('push', screenName, params),
    replace: (screenName, params) => go('replace', screenName, params),
    goBack: () => router.back(),
    canGoBack: () => router.canGoBack(),
  };
}
