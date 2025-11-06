import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.href && !isLast ? (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-[#00ff88] transition-colors uppercase font-bold tracking-wide"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                  <span className="text-gray-600">/</span>
                </>
              ) : (
                <span
                  className="text-white uppercase font-bold tracking-wide"
                  itemProp="name"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
