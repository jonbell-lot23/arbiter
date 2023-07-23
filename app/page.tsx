import outputText from "../public/output.json";

export default function Page() {
  const data = outputText;

  return (
    <div>
      <div className="mt-3 ml-3 font-bold text-green-600">Memeorandum Lite</div>
      {data.map((item, index) => (
        <div key={index} className="m-3 text-sm">
          {item}
        </div>
      ))}
    </div>
  );
}
