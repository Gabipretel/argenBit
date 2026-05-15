import { fireEvent, render, screen } from "@testing-library/react-native";

import { CryptoRow } from "@/features/markets";
import type { Asset } from "@/domain/models/Asset";

const mockAsset: Asset = {
  coinId: "bitcoin",
  rank: 1,
  fsym: "BTC",
  name: "Bitcoin",
  symbolDisplay: "BTC",
  priceUsd: 95_000,
  changePercent24Hr: 1.25,
  marketCapUsd: 1e12,
  volume24hUsd: null,
  imageUrl: null,
};

describe("CryptoRow", () => {
  it("muestra nombre, símbolo y variación", () => {
    render(<CryptoRow asset={mockAsset} onPress={() => {}} />);

    expect(screen.getByText("Bitcoin")).toBeTruthy();
    expect(screen.getByText("BTC")).toBeTruthy();
    expect(screen.getByTestId("crypto-row-BTC")).toBeTruthy();
    expect(screen.getByText("+1.25%")).toBeTruthy();
  });

  it("llama onPress al tocar la fila", () => {
    const onPress = jest.fn();
    render(<CryptoRow asset={mockAsset} onPress={onPress} />);

    fireEvent.press(screen.getByLabelText(/Bitcoin.*BTC/));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
