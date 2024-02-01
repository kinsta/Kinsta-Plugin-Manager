import { useState, useEffect } from 'react';

import KinstaLogo from './images/kinsta_logo.png';

const App = () => {
	const [pluginName, setPluginName] = useState('');
	const [plugins, setPlugins] = useState([]);
	const [sites, setSites] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showStatusBar, setShowStatusBar] = useState(false);

	const KinstaAPIUrl = 'https://api.kinsta.com/v2';

	const getSitesWithPluginData = async () => {
		const query = new URLSearchParams({
			company: process.env.REACT_APP_KINSTA_COMPANY_ID,
		}).toString();

		const resp = await fetch(`${KinstaAPIUrl}/sites?${query}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${process.env.REACT_APP_KINSTA_API_KEY}`,
			},
		});

		const data = await resp.json();
		const companySites = data.company.sites;

		// Get all environments for each site
		const sitesEnvironmentData = companySites.map(async (site) => {
			const siteId = site.id;

			const resp = await fetch(`${KinstaAPIUrl}/sites/${siteId}/environments`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${process.env.REACT_APP_KINSTA_API_KEY}`,
				},
			});

			const data = await resp.json();
			const environments = data.site.environments;

			return {
				id: siteId,
				name: site.display_name,
				environments: environments,
			};
		});

		// Wait for all the promises to resolve
		const sitesData = await Promise.all(sitesEnvironmentData);

		// Get all plugins for each environment
		const sitesWithPlugin = sitesData.map(async (site) => {
			const environmentId = site.environments[0].id;

			const resp = await fetch(
				`${KinstaAPIUrl}/sites/environments/${environmentId}/plugins`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${process.env.REACT_APP_KINSTA_API_KEY}`,
					},
				}
			);

			const data = await resp.json();
			const plugins = data.environment.container_info;

			return {
				env_id: environmentId,
				name: site.name,
				plugins: plugins,
			};
		});

		// Wait for all the promises to resolve
		const sitesWithPluginData = await Promise.all(sitesWithPlugin);
		return sitesWithPluginData;
	};

	useEffect(() => {
		const fetchAllSitesPlugins = async () => {
			const sitesWithPluginData = await getSitesWithPluginData();

			// get all plugins
			const allPlugins = sitesWithPluginData.map((site) => {
				const { plugins } = site;
				return plugins.wp_plugins.data;
			});

			// get unique plugins
			const uniquePlugins = [
				...new Set(allPlugins.flat().map((plugin) => plugin.name)),
			];

			setPlugins(uniquePlugins);
		};

		fetchAllSitesPlugins();
	}, []);

	const fetchSites = async () => {
		setIsLoading(true);
		setSites([]);

		const sitesWithPluginData = await getSitesWithPluginData();

		// Filter out sites that don't have the plugin
		const sitesWithPluginDataFiltered = sitesWithPluginData
			.filter((site) => {
				const sitePlugins = site.plugins.wp_plugins.data;
				return sitePlugins.some((plugin) => {
					return plugin.name === pluginName;
				});
			})
			.map((site) => {
				const { env_id, name } = site;
				const { version, status, update, update_version } =
					site.plugins.wp_plugins.data.find(
						(plugin) => plugin.name === pluginName
					);
				return {
					env_id,
					name,
					version,
					status,
					updateAvailable: update,
					updateVersion: update_version,
				};
			});

		setSites(sitesWithPluginDataFiltered);
		setIsLoading(false);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		fetchSites();
	};

	// Update plugin
	const updatePlugin = async (envId, pluginVersion) => {
		const resp = await fetch(
			`${KinstaAPIUrl}/sites/environments/${envId}/plugins`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.REACT_APP_KINSTA_API_KEY}`,
				},
				body: JSON.stringify({
					name: pluginName,
					update_version: pluginVersion,
				}),
			}
		);

		const data = await resp.json();
		if (data.status === 202) {
			setShowStatusBar(true);

			const interval = setInterval(() => {
				checkPluginUpdateStatus(data.operation_id)
					.then((status) => {
						console.log(status);

						if (status === 200) {
							setShowStatusBar(false);
							clearInterval(interval);
							fetchSites();
						}
					})
					.catch((error) => {
						// Handle any errors that occur during the promise resolution
						console.error('Error:', error);
					});
			}, 5000);
		}
	};

	// Update all plugins
	const updateAllPlugins = async () => {
		sites.map(async (site) => {
			if (site.updateAvailable === 'available') {
				const environmentId = site.env_id;

				const resp = await fetch(
					`${KinstaAPIUrl}/sites/environments/${environmentId}/plugins`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${process.env.REACT_APP_KINSTA_API_KEY}`,
						},
						body: JSON.stringify({
							name: pluginName,
							update_version: site.updateVersion,
						}),
					}
				);

				const data = await resp.json();
				if (data.status === 202) {
					setShowStatusBar(true);

					const interval = setInterval(() => {
						checkPluginUpdateStatus(data.operation_id)
							.then((status) => {
								console.log(status);

								if (status === 200) {
									setShowStatusBar(false);
									clearInterval(interval);
									fetchSites();
								}
							})
							.catch((error) => {
								// Handle any errors that occur during the promise resolution
								console.error('Error:', error);
							});
					}, 5000);
				}
			}
		});
	};

	// Check plugin update status
	const checkPluginUpdateStatus = async (operationId) => {
		const resp = await fetch(`${KinstaAPIUrl}/operations/${operationId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${process.env.REACT_APP_KINSTA_API_KEY}`,
			},
		});

		const data = await resp.json();
		return data.status;
	};

	return (
		<div className="container">
			{showStatusBar && (
				<div className="status-bar">
					<p>Updating WordPress plugin in progress...</p>
				</div>
			)}
			<div className="title-section">
				<img src={KinstaLogo} className="logo" alt="" />
				<h2>Manage your site's plugins</h2>
				<p>
					Easily update plugins across all sites hosted with Kinsta using the
					Kinsta API.
				</p>
			</div>
			<div className="info-section">
				<p>
					This application allows you to retrieve a list of all sites within
					your company that use a specific plugin. You can then choose to update
					the plugin across all these sites simultaneously or individually.
				</p>
			</div>
			<div className="form-section">
				<form>
					<div className="form-control">
						<label htmlFor="plugin-name">Plugin name</label>
						<select
							name="plugin-name"
							id="plugin-name"
							value={pluginName}
							onChange={(e) => setPluginName(e.target.value.toLowerCase())}
						>
							{plugins.length > 0 ? (
								<>
									<option value="">Select a plugin</option>
									{plugins.map((plugin) => (
										<option key={plugin} value={plugin.toLowerCase()}>
											{plugin}
										</option>
									))}
								</>
							) : (
								<option value="">Loading plugins...</option>
							)}
						</select>
					</div>
					<button className="btn" onClick={handleSubmit}>
						Fetch sites with this plugin
					</button>
				</form>
			</div>
			{isLoading && (
				<div className="loading">
					<p>Loading...</p>
				</div>
			)}
			{sites.length > 0 && (
				<div className="display_container">
					<div className="site-list">
						<div className="list-title">
							<h3>Sites with {pluginName} plugin</h3>

							{sites.filter((site) => site.updateAvailable === 'available')
								.length > 1 && (
								<button className="sm-btn" onClick={updateAllPlugins}>
									Update all sites to v.
									{
										sites.find((site) => site.updateVersion !== null)
											?.updateVersion
									}
								</button>
							)}

							{sites.every((site) => site.updateAvailable !== 'available') && (
								<p>All sites are up to date</p>
							)}
						</div>
						<ul>
							{sites.map((site) => (
								<li key={site.env_id}>
									<div className="info">
										<p>
											<b>Site Name:</b> {site.name}
										</p>
										<p>
											<b>Plugin Status:</b> {site.status}
										</p>
										<p>
											<b>Plugin Version:</b> {site.version}
										</p>
									</div>
									<button
										className={`sm-btn ${
											site.updateAvailable !== 'available' ? 'disabled-btn' : ''
										}`}
										disabled={site.updateAvailable !== 'available'}
										onClick={() =>
											updatePlugin(site.env_id, site.updateVersion)
										}
									>
										{site.updateAvailable === 'available'
											? `Update to v.${site.updateVersion}`
											: 'Up to date'}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
