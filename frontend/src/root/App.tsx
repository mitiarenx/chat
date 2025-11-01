import { Navigate, Route, Routes } from "react-router";
import Chat from "../pages/Chat";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Prettifier from "../utils/Prettifier";
import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";
import PageLoader from "../utils/PageLoader";

interface User {
	id: number,
	username: string
}

const App: React.FC = () => {
	
	const [ authUser, setAuthUser ] = useState<User | null>(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const	checkAuth = useCallback( async () => {
		try {
			const res = await  axiosInstance.get<User>("/auth/check");
			setAuthUser(res.data);
		} catch(error) {
			console.log("Authentication check failed: ", error);
			setAuthUser(null);
		} finally {
			setIsCheckingAuth(false);
		}
	}, []);
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);
	if (isCheckingAuth) {
		return (<><PageLoader/></>)
	}

	console.log({authUser});

	return (
		<div className="bg-gray-900 min-h-screen overflow-hidden flex justify-center items-center">
			<Prettifier/>
			<div className="relative z-10 flex text-6xl text-amber-50">
				<Routes>
					<Route path="/signup" element={!authUser ? <Signup/> : <Navigate to="/"/>} />
					<Route path="/login" element={!authUser ? <Login/> : <Navigate to="/"/>} />
					<Route path="/" element={authUser ? <Chat/> : <Navigate to="/login"/>} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
