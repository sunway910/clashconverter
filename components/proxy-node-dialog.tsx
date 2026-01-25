'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';

const proxyScripts = [
  {
    id: 'v2ray-wss',
    icon: '🌐',
  },
  {
    id: 'v2ray',
    icon: '⚙️',
  },
  {
    id: 'v2ray-agent',
    icon: '🔧',
  },
  {
    id: 'marzban',
    icon: '🎛️',
  },
] as const;
