function PageLoader() {
	return (
	<div className="bg-gray-900 min-h-screen flex justify-center items-center">
		<div className="flex flex-col items-center justify-center p-20 text-amber-50">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
			<p>Vérification de l'authentification...</p>
		</div>
	</div>
	);
}

export default PageLoader