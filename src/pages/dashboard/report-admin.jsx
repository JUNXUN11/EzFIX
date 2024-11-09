import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Input,
  Button,
} from "@material-tailwind/react";
import { reportsTableData } from "@/data";
import { useState } from "react";

export function AdminReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filterType, setFilterType] = useState("");

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    let sortableItems = [...reportsTableData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  const filteredData = sortedData().filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType ? item.damagetype === filterType : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Reported Damages
          </Typography>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm py-1.5 px-3 border rounded-lg bg-white text-blue-gray-700 shadow-md"
            >
              <option value="">All Damage Types</option>
              <option value="electrical">Electrical</option>
              <option value="civil">Civil</option>
              <option value="piping">Piping</option>
              <option value="sanitary">Sanitary</option>
              <option value="pest control">Pest Control</option>
            </select>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["name", "block no.", "room no.", "damage type", "description", "date", "status"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer"
                    onClick={() => handleSort(el.replace(/ /g, "").toLowerCase())}
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                      {sortConfig.key === el.replace(/ /g, "").toLowerCase() ? (
                        sortConfig.direction === "asc" ? " ▲" : " ▼"
                      ) : null}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(
                ({ img, name, email, blockno, roomno, damagetype, description, date }, key) => {
                  const className = `py-3 px-5 ${
                    key === reportsTableData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={name}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar src={img} alt={name} size="sm" variant="rounded" />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {name}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {blockno}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {roomno}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={
                            damagetype === "electrical"
                              ? "red"
                              : damagetype === "civil"
                              ? "blue"
                              : damagetype === "piping"
                              ? "green"
                              : damagetype === "sanitary"
                              ? "yellow"
                              : damagetype === "pest control"
                              ? "orange"
                              : "blue-gray" // Default color
                          }
                          value={damagetype.charAt(0).toUpperCase() + damagetype.slice(1)} // Capitalize the first letter
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {description}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {date}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Button
                          variant="text"
                          color="blue-gray"
                          className="text-xs font-semibold"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default AdminReport;
