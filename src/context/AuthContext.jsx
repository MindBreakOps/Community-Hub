import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
	const getSession = async () => {
	  const { data: { session } } = await supabase.auth.getSession();
	  if (session?.user) {
		await loadUserProfileAndWorkspace(session.user.id);
	  } else {
		setLoading(false);
	  }
	};

	getSession();

	const { data: authListener } = supabase.auth.onAuthStateChange(
	  async (event, session) => {
		if (session?.user) {
		  await loadUserProfileAndWorkspace(session.user.id);
		} else {
		  setUser(null);
		  setWorkspace(null);
		  setLoading(false);
		}
	  }
	);

	return () => {
	  authListener.subscription.unsubscribe();
	};
  }, []);

  const loadUserProfileAndWorkspace = async (userId) => {
	try {
	  const { data: profileData, error: profileError } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	  if (profileError) throw profileError;

	  setUser({ id: userId, ...profileData });

	  if (profileData?.workspace_id) {
		const { data: workspaceData, error: workspaceError } = await supabase
		  .from('workspaces')
		  .select('*')
		  .eq('id', profileData.workspace_id)
		  .single();

		if (workspaceError) throw workspaceError;
		setWorkspace(workspaceData);
	  }
	} catch (error) {
	  console.error("Error loading user context:", error.message);
	} finally {
	  setLoading(false);
	}
  };

  const signOut = async () => {
	await supabase.auth.signOut();
  };

  return (
	<AuthContext.Provider value={{ user, workspace, loading, signOut }}>
	  {!loading && children}
	</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);