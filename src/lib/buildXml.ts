import type { Customer, Line } from '../types';
import { PRIORITY, XML as K } from '../constants';
import { buildDetailErpOrder, buildShipmentId } from './shipmentId';

export interface BuildContext {
  /** Número que devuelve el servicio de contador */
  num: number;
  /** "2026-09-21T17:07:12" (hora local, sin zona) */
  orderDate: string;
}

export function escapeXml(v: string | number): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Hora LOCAL. No uses toISOString(): devuelve UTC con milisegundos y "Z". */
export function formatOrderDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
}

export function buildXml(c: Customer, lines: Line[], ctx: BuildContext): string {
  const e = escapeXml;
  const a = c.shipTo;
  const shipmentId = buildShipmentId(c.storeNo, ctx.num);
  const detailOrder = buildDetailErpOrder(c.storeNo, ctx.num);

  // ErpOrderLineNum: secuencia nueva por pedido, 1..N
  const details = lines
    .map(
      (l, i) => `          <ShipmentDetail>
            <Action>${K.action}</Action>
            <ErpOrder>${e(detailOrder)}</ErpOrder>
            <ErpOrderLineNum>${i + 1}</ErpOrderLineNum>
            <RequestedQty>${l.cantidad}</RequestedQty>
            <SKU>
              <Company>${K.company}</Company>
              <Item>${e(l.sku)}</Item>
              <Quantity>${l.cantidad}</Quantity>
              <QuantityUm>${K.uom}</QuantityUm>
            </SKU>
            <TotalQuantity>${l.cantidad}</TotalQuantity>
          </ShipmentDetail>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<WMWROOT xmlns="http://www.manh.com/ILSNET/Interface" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.manh.com/ILSNET/Interface schema.xsd">
  <WMWDATA>
    <Shipments>
      <Shipment>
        <Action>${K.action}</Action>
        <UserDef6>${K.userDef6}</UserDef6>
        <UserDef8>${e(c.storeNo)}</UserDef8>
        <AllocateComplete>${K.allocateComplete}</AllocateComplete>
        <Comments>
          <Comment>
            <CommentType>${K.commentType}</CommentType>
            <Text>${e(c.code.toUpperCase())}</Text>
          </Comment>
        </Comments>
        <ConsolidationAllowed>${K.consolidationAllowed}</ConsolidationAllowed>
        <Customer>
          <Carrier>${K.carrier}</Carrier>
          <CarrierService>${K.carrierService}</CarrierService>
          <Company>${K.company}</Company>
          <CustomerAddress>
            <Name>${e(c.code)}</Name>
          </CustomerAddress>
          <Customer>${e(c.code)}</Customer>
          <CustomerCategories>
            <Category1>${c.orderType}</Category1>
            <Category10>${e(c.category10)}</Category10>
            <Category2>${e(c.category2)}</Category2>
            <Category8>${K.category8}</Category8>
          </CustomerCategories>
          <ShipTo>${e(c.code)}</ShipTo>
          <ShipToAddress>
            <Address1>${e(a.address1)}</Address1>
            <Address2>${e(a.address2)}</Address2>
            <Address3>${e(a.address3)}</Address3>
            <City>${e(a.city)}</City>
            <Country>${K.country}</Country>
            <Name>${e(c.code)}</Name>
            <PostalCode>${e(a.postalCode)}</PostalCode>
            <State>${e(a.state)}</State>
          </ShipToAddress>
        </Customer>
        <CustomerPO>${ctx.num}</CustomerPO>
        <ErpOrder>${e(shipmentId)}</ErpOrder>
        <OrderDate>${ctx.orderDate}</OrderDate>
        <OrderType>${c.orderType}</OrderType>
        <Priority>${PRIORITY}</Priority>
        <ShipmentId>${e(shipmentId)}</ShipmentId>
        <UserDef13>${K.userDef13}</UserDef13>
        <Warehouse>${K.warehouse}</Warehouse>
        <Details>
${details}
        </Details>
      </Shipment>
    </Shipments>
  </WMWDATA>
</WMWROOT>
`;
}
