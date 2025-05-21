import userService from '@/services/userService';

import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  SkipToContent,
  Switcher,
  SwitcherItem,
  SwitcherDivider,
  SideNav,
  SideNavItems,
  HeaderSideNavItems,
  Modal,
} from '@carbon/react';
import {
  Switcher as SwitcherIcon,
  Notification,
  UserAvatar,
  Close,
  Sprout,
} from '@carbon/icons-react';

const MediConnectHeader = () => {
  const { isLoggedIn, role, firstName, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoginCheckModalOpen, setIsLoginCheckModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        showNotificationMenu
      ) {
        setShowNotificationMenu(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        showUserMenu
      ) {
        setShowUserMenu(false);
      }
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        isPanelOpen
      ) {
        setIsPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationMenu, showUserMenu, isPanelOpen]);

  if (!isMounted) {
    return null;
  }

  const toggleNotificationMenu = () => {
    setShowNotificationMenu(!showNotificationMenu);
    setIsPanelOpen(false);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotificationMenu(false);
    setIsPanelOpen(false);
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
    setShowNotificationMenu(false);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    try {
      const response = await userService.logoutUser();
      console.log('Logout successful:', response);

      setIsLoggedIn(false);
      setIsLogoutModalOpen(true);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleLogoutModalClose = () => {
    setIsLoginCheckModalOpen(false);
    setIsLogoutModalOpen(false);
    router.push('/login');
  };

  return (
    <div className="header-wrapper">
      <HeaderContainer
        className="header-container"
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <Header aria-label="mediC-header">
            <SkipToContent />
            <HeaderMenuButton
              aria-label="Open menu"
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
            />

            <Link href="/">
              <HeaderName prefix="Medi-Connect"></HeaderName>
            </Link>

            <HeaderNavigation aria-label="mediC-header">
              <HeaderMenuItem
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsLoginCheckModalOpen(true);
                  } else if (role === 'Patient') {
                    router.push('/patient-appointment');
                  } else if (role === 'Physician') {
                    router.push('/physician-appointment');
                  }
                }}>
                Appointment
              </HeaderMenuItem>
              <HeaderMenuItem
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsLoginCheckModalOpen(true);
                  } else if (role === 'Patient') {
                    router.push('/patient-scheduling');
                  } else if (role === 'Physician') {
                    router.push('/physician-scheduling');
                  }
                }}>
                Scheduling
              </HeaderMenuItem>
            </HeaderNavigation>

            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}>
              <SideNavItems>
                <HeaderSideNavItems>
                  <HeaderMenuItem
                    onClick={() => {
                      if (!isLoggedIn) {
                        setIsLoginCheckModalOpen(true);
                      } else if (role === 'Patient') {
                        router.push('/patient-appointment');
                      } else if (role === 'Physician') {
                        router.push('/physician-appointment');
                      }
                    }}>
                    Appointment
                  </HeaderMenuItem>
                  <HeaderMenuItem
                    onClick={() => {
                      if (!isLoggedIn) {
                        setIsLoginCheckModalOpen(true);
                      } else if (role === 'Patient') {
                        router.push('/patient-scheduling');
                      } else if (role === 'Physician') {
                        router.push('/physician-scheduling');
                      }
                    }}>
                    Scheduling
                  </HeaderMenuItem>
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>

            <HeaderGlobalBar>
              <HeaderGlobalAction
                aria-label="Notifications"
                onClick={toggleNotificationMenu}>
                <Notification size={20} />
              </HeaderGlobalAction>
              {showNotificationMenu && (
                <div ref={notificationRef} className="notification-menu">
                  <p>You don&apos;t have new notifications</p>
                </div>
              )}

              <HeaderGlobalAction
                aria-label="User Avatar"
                tooltipAlignment="center"
                onClick={toggleUserMenu}
                className="action-icons">
                <UserAvatar size={20} />
              </HeaderGlobalAction>

              {showUserMenu && (
                <div ref={userMenuRef} className="user-menu">
                  {isLoggedIn ? (
                    <>
                      <p>
                        <Sprout style={{ marginRight: '8px' }} />
                        Hello, {firstName}!
                      </p>
                      <Button
                        kind="primary"
                        size="md"
                        onClick={() => router.push('/information')}>
                        My Info
                      </Button>
                      <Button
                        kind="primary"
                        size="md"
                        onClick={handleLogout}
                        className="right-btn">
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        kind="primary"
                        size="md"
                        onClick={() => router.push('/register')}>
                        Register
                      </Button>
                      <Button
                        kind="primary"
                        size="md"
                        onClick={() => router.push('/login')}
                        className="right-btn">
                        Log In
                      </Button>
                    </>
                  )}
                </div>
              )}  
            </HeaderGlobalBar>
          </Header>
        )}
      />

      <Modal
        open={isLogoutModalOpen}
        onRequestClose={handleLogoutModalClose}
        modalHeading="Logout Successful"
        passiveModal>
        <p>You have been successfully logged out.</p>
      </Modal>
      <Modal
        open={isLoginCheckModalOpen}
        modalHeading="Please Log In First"
        onRequestClose={handleLogoutModalClose}
        passiveModal>
        <p>You need to log in or register to access this page.</p>
      </Modal>
    </div>
  );
};

export default MediConnectHeader;
