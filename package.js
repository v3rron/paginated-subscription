Package.describe({
  name: 'verron:paginated-subscription',
  summary: "Easily paginate a subscription that takes a limit parameter and initial number of pages.",
  version: "0.3.0",
  git: "https://github.com/v3rron/paginated-subscription.git"
});

Package.onUse(function (api, where) {
  api.versionsFrom("METEOR@0.9.0");
  api.addFiles('paginated_subscription.js', 'client');
});
