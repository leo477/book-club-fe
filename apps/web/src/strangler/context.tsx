'use client';

import { createContext, useContext } from 'react';

const EnabledRoutes = createContext<readonly string[]>([]);

export const StranglerProvider = EnabledRoutes.Provider;
export const useEnabledRoutes = () => useContext(EnabledRoutes);
