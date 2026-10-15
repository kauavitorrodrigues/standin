type Props = { show: boolean };

// Says why most of the fields are locked, when maps use the asset.
export const AssetInUseNotice = ({ show }: Props) => {
    if (!show) return null;

    return (
        <p className="text-muted-foreground text-sm">
            Este asset está em uso por mapas. Só o nome, a categoria e o texto
            de interação podem mudar.
        </p>
    );
};
