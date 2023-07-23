import outputText from "../public/output.json";

export default function Page() {
  const data = outputText;

  return (
    <div>
      {data.map((item, index) => (
        <div key={index} className="m-3 bg-gray-200">
          {item}
        </div>
      ))}
    </div>
  );
}
