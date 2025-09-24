'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Home,
  Users,
  CreditCard,
  FileText,
  Trash2,
  Settings,
  Shield,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode; 
  hasDropdown?: boolean;
  href?: string;
  children?: MenuItem[];
}

const AdminSideBar = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

 
  const isItemActive = useCallback((item: MenuItem): boolean => {
    if (item.href && pathname === item.href) {
      return true;
    }

    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }

    return false;
  }, [pathname]);

  const menuItems: MenuItem[] = React.useMemo(() => [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      href: '/admin/dashboard'
    },
    {
      id: 'user-access',
      label: 'User & Access Management',
      icon: <Users className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'manage-users', label: 'Manage Users', href: '/admin/usermanagement' },
        { id: 'trade-management', label: 'Trade Management', href: '/admin/trademangment' },
        { id: 'manage-copy-experts', label: 'Manage Copy Experts', href: '/admin/copytrade' },
        { id: 'KYC Verfication', label: 'KYC Verfication', href: '/admin/kycverfication' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <CreditCard className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'wallet', label: 'Wallet', href: '/admin/wallet' },
        { id: 'card-transactions', label: 'Card Transactions', href: '/admin/cardtranstions' }
      ]
    },
    {
      id: 'deposit-management',
      label: 'Deposit Management',
      icon: <FileText className="w-5 h-5" />,
      hasDropdown: false,
      href: '/admin/deposit'
    },
    {
      id: 'withdrawal-management',
      label: 'Withdrawal Management',
      icon: <Trash2 className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'pending-withdrawals', label: 'Withdrawals Settings', href: '/admin/withdrawalsettings' },
        { id: 'Withdrawl-management', label: 'Withdrawals Management', href: '/admin/withdrawalmanagement' },
        { id: 'withdrawal-history', label: 'Code Settings (2FA)', href: '#' }
      ]
    },
    {
      id: 'wallet-management',
      label: 'Wallet Management',
      icon: <Wallet className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'user-wallet', label: 'User Wallet', href: '/admin/walletoverview' },
        { id: 'wallet-address', label: 'Wallet Address', href: '/admin/newaddress' },
        { id: 'manual-adjustments', label: 'Manual Adjustments', href: '/admin/manualmang' },
        { id: 'wallet-connect', label: 'Wallet-Connet', href: '/admin/walletconnet' },
      ]
    },
    {
      id: 'signal-management',
      label: 'Signal Management',
      icon: <BarChart3 className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'subscription', label: 'Subscription', href: '/admin/subscription' },
        { id: 'signals', label: 'Signals', href: '/admin/signal' },
        { id: 'stakes', label: 'Stakes', href: '/admin/stake' }
      ]
    },
    {
      id: 'analytics-reports',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'assets', label: 'Assets', href: '#' },
        { id: 'deposit-management-sub', label: 'Deposit Management', href: '#' }
      ]
    },
    {
      id: 'settings-control',
      label: 'Settings & Control',
      icon: <Settings className="w-5 h-5" />,
      hasDropdown: true,
      children: [
        { id: 'security', label: 'Security', href: '/admin/security' },
        { id: 'limits-global', label: 'Limits & Global Settings', href: '/admin/limit' }
      ]
    }
  ], []);

  // Auto-expand parent items if one of their children is active
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => isItemActive(child))) {
        setExpandedItems(prev =>
          prev.includes(item.id) ? prev : [...prev, item.id]
        );
      }
    });
  }, [pathname, isItemActive, menuItems]);

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item);

    const MenuContent = ({ className }: { className: string }) => (
      <div className={className}>
        <div className="flex items-center space-x-3">
          
          {depth === 0 && item.icon && React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
            className: `${(item.icon as React.ReactElement<{ className?: string }>).props.className} ${isActive ? 'text-white' : 'text-gray-300'}`
          })}
          <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
            {item.label}
          </span>
        </div>
        {hasChildren && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            )}
          </div>
        )}
      </div>
    );

    return (
      <div key={item.id} className={`${depth > 0 ? 'ml-4' : ''}`}>
        {hasChildren ? (
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200`}
            onClick={() => toggleExpanded(item.id)}
          >
            <MenuContent className="flex items-center justify-between w-full" />
          </div>
        ) : (
          <a
            href={item.href}
            className={` items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 block ${
              isActive
                ? 'bg-[#F2AF29] text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <MenuContent className="flex items-center justify-between w-full" />
          </a>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 pt-1 mt-6 bg-linear-to-b from-[#141E323D] to-[#01040F] shadow-lg text-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Admin</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  )
}

export default AdminSideBar