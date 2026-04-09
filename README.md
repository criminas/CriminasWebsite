# arcbase

Empowering everyone to change their world, by bringing open source software to the masses.

arcbase is a collection of open-source projects focused on developer tools, cloud infrastructure, and security.

## Projects

- **ArcOS**: Desktop experience for everyone.
- **Sentinel**: Advanced security toolkit for the modern web.
- **Arc Manager**: Modern local file management.
- **Mobile App**: Arcbase on the go.
- **OpenShelf**: The open-source digital library.

## Development

This website is built with [Astro](https://astro.build/) for lightning-fast delivery, [Supabase](https://supabase.com/) for authentication and PostgreSQL data storage, and [Datadog](https://www.datadoghq.com/) for Real User Monitoring.

### Setup Instructions

1. Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md) for database and RLS instructions.
2. Install dependencies: `npm install`
3. Configure your environment variables in `.env.local` with your Supabase API keys and Datadog RUM application token.
4. Run the local dev server: `npm run dev`

### Commands

| Command             | Action                                      |
| :------------------ | :------------------------------------------ |
| `npm install`       | Installs dependencies                       |
| `npm run dev`       | Starts local dev server at `localhost:4321` |
| `npm run build`     | Build the production site to `./dist/`      |
| `npm run preview`   | Preview the build locally                   |
| `npm run astro ...` | Run Astro CLI commands                      |

### Features

- **Robust Authentication**: Email magic links and Google OAuth via Supabase Auth.
- **Row Level Security**: Fully secured user profiles and metrics queried directly from the frontend.
- **Real User Monitoring**: Embedded Datadog browser RUM to continuously trace performance.
- **Automated Synthetic Testing**: E2E testing automatically triggered via GitHub Actions CI pipeline.
- **Theme Support**: Seamless Dark/Light mode professional UI.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

## License

This project is open-source. See individual projects for specific licensing details.

## Contact

Questions? Reach out to us at [arcbase@tuta.io](mailto:arcbase@tuta.io) or visit our [Contact page](https://arcbase.one/contact).
