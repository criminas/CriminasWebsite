# Criminas

Empowering everyone to change their world, by bringing open source software to the masses.

Criminas is a collection of open-source projects focused on developer tools, cloud infrastructure, and security.

## Projects

- **CrimiRepo**: The community-driven package repository for everyone.
- **Forge**: Developer tools that accelerate your workflow.
- **Nexus**: Cloud infrastructure that just works.
- **Sentinel**: Open source security for the modern web.

## Development

This website is built with [Astro](https://astro.build/) and [Convex](https://convex.dev/) for authentication and data storage.

### Authentication Setup

This site includes user authentication with GitHub and Google OAuth. To set up authentication:

1. Follow the [Convex Setup Guide](./CONVEX_SETUP.md) for detailed instructions
2. Install dependencies: `npm install`
3. Deploy Convex: `npx convex dev`
4. Configure OAuth apps (see setup guide)
5. Set environment variables in `.env.local`

### Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npx convex dev`          | Starts Convex development server                 |
| `npm run build`           | Build the production site to `./dist/`           |
| `npm run preview`         | Preview the build locally                        |
| `npm run astro ...`       | Run Astro CLI commands                           |

### Features

- **User Authentication**: Sign in with GitHub or Google
- **User Profiles**: Manage your account information
- **Project Starring**: Star your favorite projects
- **Dark Mode**: Professional dark theme with toggle
- **Responsive Design**: Mobile-first design with modern aesthetics

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

## License

This project is open-source. See individual projects for specific licensing details.

## Contact

Questions? Reach out to us at [hello@criminas.org](mailto:hello@criminas.org) or visit our [Contact page](https://criminas.org/contact).
