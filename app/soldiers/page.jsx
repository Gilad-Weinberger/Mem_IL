"use client";

import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { getAllObjects } from "@/lib/functions/dbFunctions";
import PageLayout from "@/components/PageLayout";
import SoldierSearch from "@/elements/soldiers/SoldierSearch";
import SoldierGrid from "@/elements/soldiers/SoldierGrid";

const PAGE_SIZE = 12; // Load soldiers in batches of 12

const Page = () => {
  const [allSoldiers, setAllSoldiers] = useState([]);
  const [displayedSoldiers, setDisplayedSoldiers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [warSearch, setWarSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allSoldiers, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: true,
    });
  }, [allSoldiers]);

  // Get filtered soldiers based on search and war
  const filteredSoldiers = useMemo(() => {
    let result = allSoldiers;
    if (warSearch) {
      result = result.filter((soldier) =>
        soldier.warFellIn?.toLowerCase().includes(warSearch.toLowerCase())
      );
    }
    return searchQuery
      ? fuse.search(searchQuery).map((res) => res.item)
      : result;
  }, [searchQuery, allSoldiers, warSearch, fuse]);

  // Paginate the displayed soldiers
  useEffect(() => {
    setDisplayedSoldiers(filteredSoldiers.slice(0, currentPage * PAGE_SIZE));
  }, [filteredSoldiers, currentPage]);

  // Fetch soldiers from the database
  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        const data = await getAllObjects("soldiers");
        setAllSoldiers(data);
      } catch (error) {
        console.error("Error fetching soldiers:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldiers();
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset pagination when search changes
  };

  const handleWarChange = (war) => {
    setWarSearch(war);
    setCurrentPage(1); // Reset pagination when war filter changes
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <PageLayout>
      <div className="h-full max-w-4xl mx-auto">
        <SoldierSearch
          onSearchChange={handleSearchChange}
          onWarChange={handleWarChange}
        />
        <SoldierGrid
          soldiers={displayedSoldiers}
          loading={loading}
          error={error}
          onLoadMore={handleLoadMore}
          hasMore={displayedSoldiers.length < filteredSoldiers.length}
        />
      </div>
    </PageLayout>
  );
};

export default Page;
