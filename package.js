Package.describe({
  name: 'percolate:paginated-subscription',
  summary: "Easily paginate a subscription that takes a limit parameter.",
  version: "0.2.4",
  git: "https://github.com/percolatestudio/paginated-subscription.git"
});

Package.onUse(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.addFiles('paginated_subscription.js', 'client');
});
