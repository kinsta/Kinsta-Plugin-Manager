![image](https://github.com/olawanlejoel/Kinsta-Plugin-Manager/assets/57611810/d8a51308-103f-44b7-9e0b-f9df00c98061)

# Build a tool to bulk update WordPress plugins in multiple sites with KinstaAPI

This guide walks you through the process of creating a WordPress plugin manager. This tool is designed to efficiently identify all the sites under your Kinsta company account that are utilizing a particular plugin. Once identified, you'll have the flexibility to update this plugin either across all these sites at once or on a site-by-site basis.

Read the [full article](https://kinsta.com/blog/bulk-update-plugins-wordpress/).

## Installation
1. Clone or fork the repository.

## Kinsta Application Hosting Setup
### Dependency Management

Kinsta automatically installs dependencies defined in your `package.json` file during the deployment process.

### Environment Variables
For this tool to work for your company and fetch sites based on your Kinsta account, you need to set the following environment variables in your Kinsta site's environment variables section:

```bash
REACT_APP_KINSTA_COMPANY_ID = 'YOUR_COMPANY_ID'
REACT_APP_KINSTA_API_KEY = 'YOUR_API_KEY'
```

### Port

Kinsta automatically sets the `PORT` environment variable. You should **not** define it yourself, and you should **not** hard-code it into the application.

### Start Command

When deploying an application, Kinsta automatically creates a web process based on the `npm start` in the `package.json` as the entry point.

### Deployment Lifecycle

Whenever a deployment is initiated (through creating an application or re-deploying due to an incoming commit), the `npm install` and `npm build` commands are run.

## What is Kinsta
Kinsta is a developer-centric cloud host / PaaS. We’re striving to make it easier for you to share your web projects with your users. You can focus on coding and building, and we'll take care of deployments with fast, scalable hosting. 

At Kinsta, Static Sites are free, and you can host up to 100 sites on your account for completely free.

Kinsta offers 24/7 support via our chat system, which is always one click away in [MyKinsta](https://my.kinsta.com/) for customers with a paid plan or service.

If you only have a Static Site Hosting account, we have detailed [Static Site Hosting documentation](https://kinsta.com/docs/static-site-hosting/) available. You can also connect with developers and knowledgeable community members in the [Kinsta Community](https://community.kinsta.com/c/static-sites/22) forum.

- [Start your free trial](https://kinsta.com/signup/?product_type=app-db)
- [Application Hosting](https://kinsta.com/application-hosting)
- [Database Hosting](https://kinsta.com/database-hosting)
- [Static Site Hosting](https://kinsta.com/static-site-hosting)
