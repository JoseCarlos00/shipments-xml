import type { Customer } from '../types';

interface Props {
  customers: Customer[];
  value: string;
  onChange: (v: string) => void;
  customer: Customer | undefined;
  issues: string[];
}

export function CustomerPicker({ customers, value, onChange, customer, issues }: Props) {
  return (
    <div>
      <label htmlFor="customer" className="mb-2 block text-sm font-medium">
        Customer
      </label>
      <input
        id="customer"
        list="customer-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        placeholder="Nombre o número de tienda"
        className="w-full border border-line bg-floor px-3 py-2 text-sm placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-signal"
      />
      <datalist id="customer-list">
        {customers.map((c) => (
          <option key={c.id} value={c.code} label={c.storeNo} />
        ))}
      </datalist>

      {customer && (
        <p className="mt-2 text-sm text-muted">
          Tienda {customer.storeNo}, {customer.orderType}
          <br />
          {customer.shipTo.address1}, {customer.shipTo.address3}
        </p>
      )}
      {value.trim() && !customer && <p className="mt-2 text-sm text-danger">No encontré ese customer. Elígelo de la lista.</p>}
      {issues.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-warn">
          {issues.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
