const templates = [
  {
    name: "Professional",
    preview: "/placeholder.svg",
  },
  {
    name: "Modern",
    preview: "/placeholder.svg",
  },
  {
    name: "Creative",
    preview: "/placeholder.svg",
  },
  {
    name: "Executive",
    preview: "/placeholder.svg",
  },
];

const Templates = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Professional Resume Templates
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose from our collection of ATS-friendly templates designed for success
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
          {templates.map((template) => (
            <div
              key={template.name}
              className="glass-card overflow-hidden rounded-2xl transition-transform hover:scale-105"
            >
              <img
                src={template.preview}
                alt={template.name}
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{template.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;