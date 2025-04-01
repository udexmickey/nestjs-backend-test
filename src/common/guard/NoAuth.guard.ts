import { SetMetadata } from '@nestjs/common';

// Define a constant key for the decorator metadata
export const NO_AUTH_KEY = 'no-auth';

// Create the decorator function
export const NoAuth = () => SetMetadata(NO_AUTH_KEY, true);
