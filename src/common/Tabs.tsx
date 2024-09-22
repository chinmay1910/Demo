import { Card } from '@tremor/react';
import { createContext, useContext, useState } from 'react';

type TabsContextType = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ defaultValue, children, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={`tabs ${className}`}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList = ({ children, className = '' }) => {
    return <div className={`tabs-list flex ${className}`}>{children}</div>;
};

export const TabsTrigger = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const { activeTab, setActiveTab } = context;

    return (
        <Card>

            <button
                className={`tabs-trigger px-4 py-2 ${activeTab === value ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    } ${className}`}
                onClick={() => setActiveTab(value)}
            >
                {children}
            </button>
        </Card>

    );
};

export const TabsContent = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const { activeTab } = context;

    if (activeTab !== value) return null;

    return <div className={`tabs-content ${className}`}>{children}</div>;
};
