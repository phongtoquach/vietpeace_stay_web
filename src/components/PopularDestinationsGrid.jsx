import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';


export default function PopularDestinationsGrid() {
	console.log("[PopularDestinationsGrid] Vừa vào hàm component PopularDestinationsGrid !");

	const [featuredLocations, setFeaturedLocations] = useState([]);
  	const [loading, setLoading] = useState(true);
  	const [error, setError] = useState("");

	useEffect(() => {
		let ignore = false;

		async function fetchFeaturedLocations() {
			try {
				const api_response = await fetch(import.meta.env.VITE_API_BASE_URL + "/locations/featured-locations", {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include"
                });

				if (!api_response.ok) {
					throw new Error("Không thể tải danh sách điểm đến.");
				}

				const api_response_data = await api_response.json();

				console.log("[PopularDestinationsGrid - useEffect] Data của api_response_data : ");
				console.log(api_response_data);

				if (!Array.isArray(api_response_data.data.featuredLocations)) {
					throw new Error("Dữ liệu điểm đến không hợp lệ.");
				}

				if (!ignore) {
					setFeaturedLocations(api_response_data.data.featuredLocations);
				}
			} catch (error) {
				if (!ignore) {
					setError(error.message || "Không thể tải danh sách điểm đến.");
				}
			} finally {
				if (!ignore) {
					setLoading(false);
				}
			}
		}

		console.log("[PopularDestinationsGrid - useEffect] chuẩn bị chạy hàm fetchFeaturedLocations() ! ");
		fetchFeaturedLocations();

		return () => {
			ignore = true;
		};
  	}, []);

	if (loading) {
		return <p role="status">Đang tải điểm đến...</p>;
	}

	if (error) {
		return <p role="alert">{error}</p>;
	}

  if (featuredLocations.length === 0) {
    return <p>Chưa có điểm đến nổi bật.</p>;
  }

	return (
		<div className="destinations-grid">
			{featuredLocations.map((location) => (
				<Link
					key={location.id}
					to={`/search-accommodations?locationId=${location.id}`}
					className="destination-card"
				>
					<div className="destination-card-thumb">
					<img
						src={import.meta.env.VITE_BACKEND_APP_BASE_URL + location.cover_image_url}
						alt={location.name}
						className="destination-card-img"
						referrerPolicy="no-referrer"
					/>
					</div>
					<div className="destination-card-content">
						<h3 className="destination-card-name">
							{location.name}
						</h3>
						<p className="destination-card-subtitle">
							{location.accommodation_types.map((type, index) => (
								<span key={type.id ?? index}>
									{index > 0 && " - "}
									<b>{type.count}</b> {type.name}
								</span>
							))}
						</p>
					</div>
				</Link>
			))}
		</div>
	);
}
