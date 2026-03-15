import { defineBackend } from '@aws-amplify/backend';

const backend = defineBackend({});

const deploymentEnvironment =
  process.env.AMPLIFY_ENV ?? process.env.AWS_BRANCH ?? process.env.NODE_ENV ?? 'local';

backend.addOutput({
  custom: {
    bootstrap: {
      phase: 'infra-only',
      deploymentEnvironment,
      notes: 'No auth/data resources are provisioned in this iteration.',
    },
  },
});
