import { PageHeader } from "@/components/cards/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatUSD, formatKwh, formatRupiah, KURS_USD_IDR } from "@/utils/format";
import { skus } from "@/data/skus";
import { roleDefinitions } from "@/data/roles";
import { ENERGY_TARIFF_RUPIAH_PER_KWH } from "@/data/energy";
import { CONTAINER_CAPACITY_KG } from "@/data/shipment";

export default function Settings() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Konfigurasi parameter operasional yang digunakan oleh seluruh modul FISH."
        breadcrumbs={[{ label: "FISH Operations", href: "/app/overview" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="capacity">Plant Capacity</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="sku">SKU</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="roles">User & Role</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Umum</CardTitle>
              <CardDescription>Detail perusahaan dan plant, bersifat baca-saja pada prototype ini.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nama Perusahaan</Label>
                <Input value="PT Aruna Jaya Nuswantara" readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Plant</Label>
                <Input value="Hub Pelabuhan Bungus, Padang" readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Kurs Acuan (USD/IDR)</Label>
                <Input value={`Rp${KURS_USD_IDR.toLocaleString("id-ID")}`} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Kapasitas Container</Label>
                <Input value={`${CONTAINER_CAPACITY_KG.toLocaleString("id-ID")} kg`} readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity">
          <Card>
            <CardHeader>
              <CardTitle>Kapasitas Plant</CardTitle>
              <CardDescription>Batas kapasitas harian tiap tahapan proses.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Kapasitas Processing (kg/hari)</Label>
                <Input type="number" defaultValue={20000} />
              </div>
              <div className="space-y-1.5">
                <Label>Kapasitas Freezing (kg/hari)</Label>
                <Input type="number" defaultValue={12000} />
              </div>
              <div className="space-y-1.5">
                <Label>Kapasitas Cold Storage (kg)</Label>
                <Input type="number" defaultValue={45000} />
              </div>
              <div className="space-y-1.5">
                <Label>Kapasitas Shipment per Container (kg)</Label>
                <Input type="number" defaultValue={CONTAINER_CAPACITY_KG} />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <Button variant="outline">Reset</Button>
              <Button>Simpan Perubahan</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Energi</CardTitle>
              <CardDescription>Tarif listrik dan daya peralatan utama.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tarif Listrik (Rp/kWh)</Label>
                <Input type="number" step="0.1" defaultValue={ENERGY_TARIFF_RUPIAH_PER_KWH} />
              </div>
              <div className="space-y-1.5">
                <Label>Daya Bandsaw Cutting (kW)</Label>
                <Input type="number" step="0.1" defaultValue={11.5} />
              </div>
              <div className="space-y-1.5">
                <Label>Daya Chilling (kW)</Label>
                <Input type="number" step="0.1" defaultValue={9.6} />
              </div>
              <div className="space-y-1.5">
                <Label>Daya Freezing (kW)</Label>
                <Input type="number" step="0.1" defaultValue={18.4} />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <Button variant="outline">Reset</Button>
              <Button>Simpan Perubahan</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sku">
          <Card>
            <CardHeader>
              <CardTitle>Daftar SKU</CardTitle>
              <CardDescription>Referensi harga dan yield SKU, dikelola oleh tim produk (baca-saja).</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Yield dari Loin</TableHead>
                    <TableHead>Energi</TableHead>
                    <TableHead>Ekspor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skus.map((s) => (
                    <TableRow key={s.code}>
                      <TableCell className="font-mono text-xs">{s.code}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell>{formatUSD(s.priceUsdPerKg)}/kg</TableCell>
                      <TableCell>{s.yieldFromLoinPct}%</TableCell>
                      <TableCell>{formatKwh(s.processingKwhPerKg)}/kg</TableCell>
                      <TableCell>
                        <Badge variant={s.exportEligible ? "success" : "neutral"}>
                          {s.exportEligible ? "Ya" : "Tidak"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Pricing</CardTitle>
              <CardDescription>Target margin dan batas harga minimum untuk rekomendasi pricing.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Target Margin (%)</Label>
                <Input type="number" defaultValue={22} />
              </div>
              <div className="space-y-1.5">
                <Label>Pricing Floor (% di atas HPP)</Label>
                <Input type="number" defaultValue={8} />
              </div>
              <div className="space-y-1.5">
                <Label>Kurs USD/IDR Acuan</Label>
                <Input value={formatRupiah(KURS_USD_IDR)} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Toleransi Negosiasi (%)</Label>
                <Input type="number" defaultValue={5} />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <Button variant="outline">Reset</Button>
              <Button>Simpan Perubahan</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Default Quality</CardTitle>
              <CardDescription>Ambang minimum default untuk eligibility produk.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Minimum Size Grade Default</Label>
                <Select defaultValue="14 UP">
                  <option>14 UP</option>
                  <option>20 UP</option>
                  <option>30 UP</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Minimum Quality Grade Default</Label>
                <Select defaultValue="Grade C">
                  <option>Grade C</option>
                  <option>Grade B</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Batas Umur Aging (hari)</Label>
                <Input type="number" defaultValue={7} />
              </div>
              <div className="space-y-1.5">
                <Label>Freshness Minimum untuk Ekspor</Label>
                <Select defaultValue="Baik">
                  <option>Perlu Perhatian</option>
                  <option>Baik</option>
                  <option>Prima</option>
                </Select>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <Button variant="outline">Reset</Button>
              <Button>Simpan Perubahan</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>User & Role</CardTitle>
              <CardDescription>Peran pengguna dan area fokus masing-masing pada platform FISH.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {roleDefinitions.map((r) => (
                <div key={r.name} className="rounded-lg border border-aruna-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-sm font-semibold text-aruna-text">{r.name}</p>
                    <Badge variant="outline">{r.defaultRoute}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-aruna-textSecondary">{r.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.focusAreas.map((f) => (
                      <Badge key={f} variant="default">{f}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
