'use client';

import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';

import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: string[];
  navs?:string[],
}

interface SiderbarProps {
  username?:string;
}

export default function Sidebar({username}:SiderbarProps) {
  const router=useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('home');

  const navItems: NavItem[] = [
    // {
    //   id: 'home',
    //   label: 'Dashboard',
    //   icon: HomeIcon,
    // },
    {
      id: 'gallery',
      label: 'Gallery Management',
      icon: CubeIcon,
      subItems: ['Add Folder', 'Delete Folder', 'Add Images', 'Delete Images'],
      navs :["/admin/gallery/folder/add","/admin/gallery/folder/delete","/admin/gallery/add","/admin/gallery/delete"]
    },
    {
      id: 'blogs',
      label: 'Blogs Management',
      icon: Squares2X2Icon,
      subItems: ['Add Blog', 'Delete Blog'],
      navs :["/admin/blogs/add","/admin/blogs/delete"]
    },
    {
      id: 'notices',
      label: 'Notice Management',
      icon: EyeIcon,
      subItems: ['Add Notice','Delete Notice'],
      navs :["/admin/notices/add","/admin/notices/delete"]
    },
   {
      id: 'thanks',
      label: 'Special Thanks Management',
      icon: CubeIcon,
      subItems: ['Add Thanks', 'Delete Thanks'],
      navs :["/admin/thanks/add","/admin/thanks/delete"]
    },
    {
      id: 'media',
      label: 'News Management',
      icon: EyeIcon,
      subItems: ['Add News','Delete News'],
      navs :["/admin/news/add","/admin/news/delete"]
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveItem(id);
  };

  const handleLogout = async () =>{
    try{
      const response = await axios.post(`/api/main/admin/logout`,
        {},
        {withCredentials:true}
      );

      router.push("/");
    }catch(error){
      alert(error);
    }
  }

  return (
    <>
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col
        bg-linear-to-b from-gray-900 to-gray-800 text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64 lg:w-64'}
        shadow-xl
      `}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && (
            <div className="flex items-center space-x-3" onClick={()=>{router.push("/admin")}}>
              <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg" />
              <div>
                <h1 className="font-bold text-lg">Admin Dashboard</h1>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="flex justify-center w-full">
              <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg" />
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={() => setCollapsed(true)}
            className="lg:hidden flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.id}> 
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center rounded-lg px-3 py-3 transition-all duration-200
                    ${activeItem === item.id 
                      ? 'bg-linear-to-r from-blue-600 to-purple-600 shadow-lg' 
                      : 'hover:bg-gray-700 hover:bg-opacity-50'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${activeItem === item.id ? 'text-white' : 'text-gray-300'}`} />
                  
                  {!collapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                  
                  {/* Badge for sub-items */}
                  {item.subItems && !collapsed && (
                    <span className="ml-auto bg-gray-700 text-xs px-2 py-1 rounded">
                      {item.subItems.length}
                    </span>
                  )}
                </button>

                {/* Sub-items */}
                {item.subItems && item.navs && activeItem === item.id && !collapsed && (
                  <ul className="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-4">
                    {item.subItems.map((subItem, index) => (
                      <li key={index} >
                        <button 
                        onClick={() => item.navs?.[index] && router.push(item.navs[index])}
                        className="
                          w-full text-left py-2 px-3 rounded
                          text-sm text-gray-300 hover:text-white hover:bg-gray-700
                          transition-colors duration-150
                        ">
                          {subItem}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Settings */}
        <div className={`
          border-t border-gray-700 p-4
          ${collapsed ? 'flex flex-col items-center' : ''}
        `}>
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-r from-blue-400 to-purple-500 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{username || 'Admin'}</p>
              </div>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors" onClick={()=>{handleLogout()}}>
                <ArrowRightOnRectangleIcon className="w-5 h-5"  />
              </button>
            </div>
          ) : (
            <>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors mb-2">
                <UserIcon className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </aside>

      <button
        onClick={() => setCollapsed(false)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg"
        aria-label="Open menu"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    </>
  );
}