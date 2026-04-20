# Chilaquiles TOP Frontend (Fixed)

Se mantuvo el diseño base del cliente y se agregaron:

- Flujo OTP para cliente con Firebase Phone Auth.
- Integración real con backend para login invisible y creación de pedido.
- Rutas por pathname:
  - `/` cliente
  - `/admin`
  - `/chef`
  - `/repartidor`
- Panel admin para aprobar staff e inventario.
- Panel chef para avanzar pedidos.
- Panel repartidor con links a Google Maps y Waze.

## Variables de entorno
Usa el mismo proyecto Firebase web app del backend:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_BACKEND_URL`
