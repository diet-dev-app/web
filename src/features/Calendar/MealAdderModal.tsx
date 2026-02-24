import { useEffect, useState } from 'react';
import { Modal, ListGroup, Form } from 'react-bootstrap';
import { useMealOptions } from '@/context/MealOptionsContext';
import type { MealOption } from '@/types';

interface MealAdderModalProps {
  show: boolean;
  mealTimeKey: string;
  onSelect: (optionId: number) => void;
  onClose: () => void;
}

/**
 * Modal for selecting a meal option to add to a day's meal time.
 * Shows filtered list of available meal options for the selected meal time.
 */
export default function MealAdderModal({
  show,
  mealTimeKey,
  onSelect,
  onClose,
}: MealAdderModalProps) {
  const { grouped, fetchOptions, loading } = useMealOptions();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (show) {
      fetchOptions();
    }
  }, [show, fetchOptions]);

  const options: MealOption[] = grouped[mealTimeKey] || [];

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const mealTimeLabel =
    options.length > 0 && options[0].meal_time?.label
      ? options[0].meal_time.label
      : mealTimeKey;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Añadir a {mealTimeLabel}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="text"
          placeholder="Buscar opción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
          autoFocus
        />

        {loading ? (
          <div className="text-center py-3">
            <span className="spinner-border spinner-border-sm" role="status" />
            <span className="ms-2">Cargando opciones...</span>
          </div>
        ) : filteredOptions.length === 0 ? (
          <p className="text-muted text-center py-3">
            {search
              ? 'No se encontraron opciones.'
              : 'No hay opciones para este horario. Créalas en "Opciones".'}
          </p>
        ) : (
          <ListGroup>
            {filteredOptions.map((opt) => (
              <ListGroup.Item
                key={opt.id}
                action
                onClick={() => onSelect(opt.id)}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{opt.name}</strong>
                  {opt.description && (
                    <small className="text-muted d-block">{opt.description}</small>
                  )}
                </div>
                {opt.estimated_calories && (
                  <span className="badge bg-light text-dark">
                    {opt.estimated_calories} kcal
                  </span>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
}
