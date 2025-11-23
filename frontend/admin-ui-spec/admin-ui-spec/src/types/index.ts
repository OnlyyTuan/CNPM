export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface DashboardMetrics {
    totalUsers: number;
    activeUsers: number;
    totalSales: number;
}

export interface Settings {
    theme: string;
    notificationsEnabled: boolean;
}

export interface FormField {
    label: string;
    type: string;
    value: string | number;
    required: boolean;
}

export interface DataTableColumn {
    header: string;
    accessor: string;
    sortable?: boolean;
    filterable?: boolean;
}