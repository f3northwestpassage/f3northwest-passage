// src/app/admin/layout.tsx
import { Suspense } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div>Loading admin section...</div>}>
            {children}
        </Suspense>
    );
}
